import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { getDb, ref, set, onValue, remove, push, onDisconnect, get } from '../services/firebase';
import { uploadImage } from '../services/imageUpload';
import { canMatch, getMatchScore, filterNSFW } from '../utils/filters';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { IoClose, IoSettingsSharp } from 'react-icons/io5';
import { MdSkipNext } from 'react-icons/md';
import { FaUserSecret } from 'react-icons/fa';
import { HiStatusOnline, HiStatusOffline } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';

function ChatRoom({ userProfile, roomId, onRoomFound, onLeaveRoom, onSkip, isSearching, onOpenSettings }) {
  const [messages, setMessages] = useState([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [partnerNickname, setPartnerNickname] = useState('');
  const [userId] = useState(uuidv4());
  const [searchAttempts, setSearchAttempts] = useState(0);
  
  const db = getDb();
  const typingTimeoutRef = useRef(null);
  const matchCheckIntervalRef = useRef(null);
  const errorTimeoutRefs = useRef([]);

  const joinWaitingList = useCallback(async () => {
    const waitingRef = ref(db, `waitingList/${userId}`);
    await set(waitingRef, {
      userId,
      nickname: userProfile.nickname,
      gender: userProfile.gender,
      genderPreference: userProfile.genderPreference,
      tags: userProfile.tags || [],
      nsfwEnabled: userProfile.nsfwEnabled || false,
      timestamp: Date.now()
    });

    // Remove from waiting list on disconnect
    onDisconnect(waitingRef).remove();
  }, [db, userId, userProfile]);

  const createRoom = useCallback(async (partner) => {
    // Use deterministic room ID based on sorted user IDs to prevent duplicates
    // Safe to use underscore as delimiter since UUIDs use hyphens, not underscores
    const sortedIds = [userId, partner.userId].sort();
    const newRoomId = `${sortedIds[0]}_${sortedIds[1]}`;
    const roomRef = ref(db, `rooms/${newRoomId}`);

    // Check if room already exists
    const existingRoom = await get(roomRef);
    if (existingRoom.exists()) {
      // Room already created by partner, just join it
      await remove(ref(db, `waitingList/${userId}`));
      
      if (matchCheckIntervalRef.current) {
        clearInterval(matchCheckIntervalRef.current);
      }
      
      setPartnerNickname(partner.nickname);
      onRoomFound(newRoomId);
      return;
    }
    
    // Create room with both users atomically
    await set(roomRef, {
      users: {
        [userId]: {
          nickname: userProfile.nickname,
          connected: true,
          joinedAt: Date.now()
        },
        [partner.userId]: {
          nickname: partner.nickname,
          connected: true,
          joinedAt: Date.now()
        }
      },
      createdAt: Date.now(),
      nsfwEnabled: userProfile.nsfwEnabled
    });

    // Remove both users from waiting list
    await remove(ref(db, `waitingList/${userId}`));
    await remove(ref(db, `waitingList/${partner.userId}`));

    // Clear match interval
    if (matchCheckIntervalRef.current) {
      clearInterval(matchCheckIntervalRef.current);
    }

    setPartnerNickname(partner.nickname);
    onRoomFound(newRoomId);
  }, [db, userId, userProfile, onRoomFound]);

  const findMatch = useCallback(async () => {
    const waitingListRef = ref(db, 'waitingList');
    const snapshot = await get(waitingListRef);
    
    if (!snapshot.exists()) return;

    const waitingUsers = [];
    snapshot.forEach((child) => {
      const user = child.val();
      if (user.userId !== userId) {
        waitingUsers.push(user);
      }
    });

    if (waitingUsers.length === 0) return;

    // Find best match
    let bestMatch = null;
    let bestScore = -1;

    for (const user of waitingUsers) {
      if (canMatch(userProfile, user)) {
        const score = getMatchScore(userProfile, user);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = user;
        }
      }
    }

    if (bestMatch) {
      await createRoom(bestMatch);
    }
  }, [db, userId, userProfile, createRoom]);

  const checkForExistingRoom = useCallback(async () => {
    // Check if a partner already created a room for us
    const roomsRef = ref(db, 'rooms');
    const roomsSnapshot = await get(roomsRef);
    
    if (!roomsSnapshot.exists()) return null;
    
    // Look for a room that includes our userId
    let foundRoom = null;
    roomsSnapshot.forEach((child) => {
      const roomData = child.val();
      if (roomData.users && roomData.users[userId]) {
        foundRoom = {
          roomId: child.key,
          ...roomData
        };
      }
    });
    
    return foundRoom;
  }, [db, userId]);

  const startMatchmaking = useCallback(() => {
    // Check for matches every 2 seconds
    matchCheckIntervalRef.current = setInterval(async () => {
      setSearchAttempts(prev => prev + 1);
      
      // First check if someone already created a room for us
      const existingRoom = await checkForExistingRoom();
      if (existingRoom) {
        // Remove from waiting list
        await remove(ref(db, `waitingList/${userId}`));
        
        // Clear match interval
        if (matchCheckIntervalRef.current) {
          clearInterval(matchCheckIntervalRef.current);
        }
        
        // Get partner info
        const partnerId = Object.keys(existingRoom.users).find(id => id !== userId);
        if (partnerId) {
          setPartnerNickname(existingRoom.users[partnerId].nickname);
        }
        
        onRoomFound(existingRoom.roomId);
        return;
      }
      
      // Otherwise try to find a match
      await findMatch();
    }, 2000);
  }, [findMatch, checkForExistingRoom, db, userId, onRoomFound]);

  const handleSkip = useCallback(async () => {
    if (roomId) {
      // Leave current room
      await remove(ref(db, `rooms/${roomId}/users/${userId}`));
      
      // Check if room is empty and delete it
      const roomSnapshot = await get(ref(db, `rooms/${roomId}`));
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        const remainingUsers = Object.keys(roomData.users || {}).filter(id => id !== userId);
        if (remainingUsers.length === 0) {
          await remove(ref(db, `rooms/${roomId}`));
        }
      }
    }

    // Reset state
    setMessages([]);
    setPartnerTyping(false);
    setPartnerConnected(false);
    setPartnerNickname('');
    setSearchAttempts(0);

    // Start searching again
    onSkip();
  }, [db, roomId, userId, onSkip]);

  const handlePartnerLeft = useCallback(() => {
    setPartnerConnected(false);
    setMessages([]);
    setPartnerTyping(false);
    
    // Show notification and offer to find new partner
    setTimeout(() => {
      const findNew = window.confirm('Your partner left the chat. Would you like to find a new one?');
      if (findNew) {
        handleSkip();
      } else {
        onLeaveRoom();
      }
    }, 500);
  }, [handleSkip, onLeaveRoom]);

  const listenToRoom = useCallback(() => {
    if (!roomId) return;
    
    const roomRef = ref(db, `rooms/${roomId}`);
    
    onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Room deleted, partner left
        handlePartnerLeft();
        return;
      }

      const roomData = snapshot.val();
      
      // Check partner status
      const users = roomData.users || {};
      const partnerData = Object.entries(users).find(([id]) => id !== userId);
      
      if (!partnerData) {
        // Partner left the room
        handlePartnerLeft();
        return;
      }
      
      const [, partner] = partnerData;
      setPartnerConnected(partner.connected);
      setPartnerNickname(partner.nickname);

      // Update messages
      if (roomData.messages) {
        const messageList = Object.entries(roomData.messages).map(([id, msg]) => ({
          id,
          ...msg
        }));
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      } else {
        setMessages([]);
      }

      // Check typing status
      if (roomData.typing) {
        const partnerTypingData = Object.entries(roomData.typing).find(([id]) => id !== userId);
        setPartnerTyping(partnerTypingData ? partnerTypingData[1] : false);
      } else {
        setPartnerTyping(false);
      }
    });
  }, [db, roomId, userId, handlePartnerLeft]);

  const setupDisconnectHandler = useCallback(() => {
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);
    onDisconnect(userRef).update({ connected: false });
  }, [db, roomId, userId]);

  const leaveRoom = useCallback(async () => {
    if (!roomId) return;
    
    try {
      // Mark user as disconnected first
      await set(ref(db, `rooms/${roomId}/users/${userId}/connected`), false);
      
      // Then remove user from room
      await remove(ref(db, `rooms/${roomId}/users/${userId}`));
      
      // Check if room should be deleted
      const roomSnapshot = await get(ref(db, `rooms/${roomId}`));
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        const remainingUsers = Object.keys(roomData.users || {}).filter(id => id !== userId);
        if (remainingUsers.length === 0) {
          // No users left, delete the entire room
          await remove(ref(db, `rooms/${roomId}`));
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [db, roomId, userId]);

  // Effect: Join waiting list when searching
  useEffect(() => {
    if (isSearching) {
      joinWaitingList();
      startMatchmaking();
    }
    
    return () => {
      if (matchCheckIntervalRef.current) {
        clearInterval(matchCheckIntervalRef.current);
      }
    };
  }, [isSearching, joinWaitingList, startMatchmaking]);

  // Effect: Listen to room when connected
  useEffect(() => {
    if (roomId && !isSearching) {
      listenToRoom();
      setupDisconnectHandler();
    }

    return () => {
      if (roomId) {
        leaveRoom();
      }
      // Clear all error message timeouts on unmount
      errorTimeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      errorTimeoutRefs.current = [];
    };
  }, [roomId, isSearching, listenToRoom, setupDisconnectHandler, leaveRoom]);

  const sendMessage = async (text) => {
    if (!roomId || !text.trim()) return;

    try {
      // Check if room still exists and partner is connected
      const roomSnapshot = await get(ref(db, `rooms/${roomId}`));
      if (!roomSnapshot.exists()) {
        console.error('Room no longer exists');
        handlePartnerLeft();
        return;
      }

      const roomData = roomSnapshot.val();
      const users = roomData.users || {};
      const partnerExists = Object.keys(users).find(id => id !== userId);
      
      if (!partnerExists) {
        console.error('Partner has left the room');
        handlePartnerLeft();
        return;
      }

      // Apply NSFW filter if not in NSFW mode
      const filteredText = userProfile.nsfwEnabled ? text : filterNSFW(text, true);

      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        senderId: userId,
        senderNickname: userProfile.nickname,
        text: filteredText,
        timestamp: Date.now(),
        type: 'text'
      });

      // Clear typing indicator
      await set(ref(db, `rooms/${roomId}/typing/${userId}`), false);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  const sendImage = async (file) => {
    if (!roomId) return;

    // Check if room still exists first
    try {
      const roomSnapshot = await get(ref(db, `rooms/${roomId}`));
      if (!roomSnapshot.exists()) {
        alert('Cannot send image: Chat room no longer exists');
        handlePartnerLeft();
        return;
      }
    } catch (error) {
      console.error('Error checking room:', error);
      return;
    }

    // Show uploading message
    const tempId = Date.now();
    setMessages(prev => [...prev, {
      id: `temp-${tempId}`,
      senderId: userId,
      senderNickname: userProfile.nickname,
      text: '📤 Uploading image...',
      timestamp: tempId,
      type: 'text',
      isTemp: true
    }]);

    try {
      const result = await uploadImage(file);

      // Remove temp message
      setMessages(prev => prev.filter(m => m.id !== `temp-${tempId}`));

      if (result.success) {
        // Double-check room still exists before sending
        const roomCheck = await get(ref(db, `rooms/${roomId}`));
        if (!roomCheck.exists()) {
          alert('Cannot send image: Partner left the chat');
          handlePartnerLeft();
          return;
        }

        const messagesRef = ref(db, `rooms/${roomId}/messages`);
        const newMessageRef = push(messagesRef);

        await set(newMessageRef, {
          senderId: userId,
          senderNickname: userProfile.nickname,
          imageUrl: result.url,
          timestamp: Date.now(),
          type: 'image'
        });
      } else {
        // Show error in chat
        setMessages(prev => [...prev, {
          id: `error-${tempId}`,
          senderId: userId,
          senderNickname: 'System',
          text: `❌ Failed to upload image: ${result.error}. Please try again or use a different image.`,
          timestamp: Date.now(),
          type: 'text',
          isTemp: true
        }]);
        
        // Remove error message after 5 seconds
        const timeoutId = setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== `error-${tempId}`));
        }, 5000);
        errorTimeoutRefs.current.push(timeoutId);
      }
    } catch (error) {
      // Remove temp message
      setMessages(prev => prev.filter(m => m.id !== `temp-${tempId}`));
      
      // Show error
      console.error('Image upload error:', error);
      setMessages(prev => [...prev, {
        id: `error-${tempId}`,
        senderId: userId,
        senderNickname: 'System',
        text: '❌ Failed to upload image. Please try again.',
        timestamp: Date.now(),
        type: 'text',
        isTemp: true
      }]);
      
      // Remove error message after 5 seconds
      const timeoutId = setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== `error-${tempId}`));
      }, 5000);
      errorTimeoutRefs.current.push(timeoutId);
    }
  };

  const handleTyping = (isTyping) => {
    if (!roomId) return;

    const typingRef = ref(db, `rooms/${roomId}/typing/${userId}`);
    set(typingRef, isTyping);

    // Auto-clear typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        set(typingRef, false);
      }, 3000);
    }
  };

  if (isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full card-glass p-10 relative z-10"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="text-7xl mb-6 inline-block"
          >
            <div className="relative">
              <FaUserSecret className="text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-50"></div>
            </div>
          </motion.div>
          <h2 className="text-3xl font-black mb-4 gradient-text">Finding your match...</h2>
          <p className="text-gray-300 mb-8 text-base font-medium">
            {searchAttempts === 0 ? '🔍 Initializing matchmaking...' : searchAttempts < 5 ? '✨ Looking for someone with similar interests...' : `⏳ Still searching... (${searchAttempts}s)`}
          </p>
          <div className="flex gap-3 justify-center mb-10">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="w-3 h-3 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-xl"
              />
            ))}
          </div>
          <motion.button
            onClick={onLeaveRoom}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold"
          >
            <IoClose /> Cancel Search
          </motion.button>
          <p className="text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
            <HiSparkles className="text-purple-400" /> Tip: Add interest tags for better matches!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header - Modern style */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-4 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar circle */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xl relative ${
            partnerConnected ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-slate-700/50 backdrop-blur-sm'
          }`}>
            <FaUserSecret />
            {partnerConnected && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-900 rounded-full animate-pulse"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg truncate gradient-text">{partnerNickname || 'Ghost User'}</span>
            </div>
            {partnerTyping ? (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-purple-400 font-medium">typing</span>
                <div className="flex gap-1">
                  <span className="typing-dot" style={{ animationDelay: '0ms' }}>•</span>
                  <span className="typing-dot" style={{ animationDelay: '200ms' }}>•</span>
                  <span className="typing-dot" style={{ animationDelay: '400ms' }}>•</span>
                </div>
              </div>
            ) : (
              <span className={`text-sm flex items-center gap-1.5 font-medium ${partnerConnected ? 'text-green-400' : 'text-gray-500'}`}>
                {partnerConnected ? <><HiStatusOnline /> online</> : <><HiStatusOffline /> offline</>}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={onOpenSettings}
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 rounded-xl transition-all text-base border border-slate-600/50"
            title="Settings"
          >
            <IoSettingsSharp />
          </motion.button>
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 border border-slate-600/50"
            title="Skip to next person"
          >
            <MdSkipNext className="text-lg" /> Next
          </motion.button>
          <motion.button
            onClick={onLeaveRoom}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 shadow-lg"
            title="Leave chat"
          >
            <IoClose className="text-lg" /> Leave
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <MessageList 
        messages={messages} 
        currentUserId={userId} 
        partnerTyping={partnerTyping}
        partnerNickname={partnerNickname}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onSendImage={sendImage}
        onTyping={handleTyping}
      />
    </div>
  );
}

export default ChatRoom;
