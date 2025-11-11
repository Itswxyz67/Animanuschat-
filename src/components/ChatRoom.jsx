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
        {/* Enhanced animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="text-center max-w-lg w-full card-glass p-12 relative z-10"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.15, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="text-8xl mb-8 inline-block"
          >
            <div className="relative">
              <FaUserSecret className="text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-60 animate-pulse"></div>
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black mb-6 gradient-text"
          >
            Finding your match...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 mb-10 text-lg font-semibold bg-slate-800/40 backdrop-blur-sm px-6 py-3 rounded-2xl"
          >
            {searchAttempts === 0 ? '🔍 Initializing matchmaking...' : searchAttempts < 5 ? '✨ Looking for someone with similar interests...' : `⏳ Still searching... (${searchAttempts}s)`}
          </motion.p>
          <div className="flex gap-4 justify-center mb-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
                className="w-3.5 h-3.5 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-2xl shadow-purple-500/50"
              />
            ))}
          </div>
          <motion.button
            onClick={onLeaveRoom}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-2.5 text-lg font-bold shadow-xl hover:shadow-2xl"
          >
            <IoClose className="text-xl" /> Cancel Search
          </motion.button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400 mt-6 flex items-center justify-center gap-2 bg-purple-500/10 backdrop-blur-sm px-4 py-2.5 rounded-full"
          >
            <HiSparkles className="text-purple-400 text-lg" /> Tip: Add interest tags for better matches!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header - Enhanced style */}
      <div className="bg-slate-900/70 backdrop-blur-2xl border-b-2 border-slate-700/40 px-6 py-4 flex items-center justify-between shadow-2xl relative z-10">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar circle with gradient ring */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-2xl relative transition-all ${
              partnerConnected 
                ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient' 
                : 'bg-slate-700/60 backdrop-blur-md'
            }`}>
              <FaUserSecret />
            </div>
            {partnerConnected && (
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-400 border-3 border-slate-900 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xl truncate gradient-text">{partnerNickname || 'Ghost User'}</span>
            </div>
            {partnerTyping ? (
              <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full inline-flex">
                <span className="text-sm text-indigo-400 font-bold">typing</span>
                <div className="flex gap-0.5">
                  <span className="typing-dot" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="typing-dot" style={{ animationDelay: '200ms' }}>●</span>
                  <span className="typing-dot" style={{ animationDelay: '400ms' }}>●</span>
                </div>
              </div>
            ) : (
              <span className={`text-sm flex items-center gap-2 font-bold ${partnerConnected ? 'text-green-400' : 'text-gray-400'}`}>
                {partnerConnected ? <><HiStatusOnline className="text-lg animate-pulse" /> Online</> : <><HiStatusOffline className="text-lg" /> Offline</>}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2.5">
          <motion.button
            onClick={onOpenSettings}
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            className="p-3 bg-slate-700/60 backdrop-blur-md hover:bg-slate-600/70 rounded-2xl transition-all text-lg border border-slate-600/30 shadow-lg hover:shadow-xl"
            title="Settings"
          >
            <IoSettingsSharp />
          </motion.button>
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-slate-700/60 backdrop-blur-md hover:bg-slate-600/70 rounded-2xl transition-all text-sm font-bold flex items-center gap-2 border border-slate-600/30 shadow-lg hover:shadow-xl"
            title="Skip to next person"
          >
            <MdSkipNext className="text-xl" /> Next
          </motion.button>
          <motion.button
            onClick={onLeaveRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-2xl transition-all text-sm font-bold flex items-center gap-2 shadow-2xl shadow-red-500/40 hover:shadow-red-500/60"
            title="Leave chat"
          >
            <IoClose className="text-xl" /> Leave
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
