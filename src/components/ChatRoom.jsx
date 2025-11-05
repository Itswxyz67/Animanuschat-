import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { getDb, ref, set, onValue, remove, push, onDisconnect, get } from '../services/firebase';
import { uploadImage } from '../services/imageUpload';
import { canMatch, getMatchScore, filterNSFW } from '../utils/filters';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatRoom({ userProfile, roomId, onRoomFound, onLeaveRoom, onSkip, isSearching }) {
  const [messages, setMessages] = useState([]);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [partnerNickname, setPartnerNickname] = useState('');
  const [userId] = useState(uuidv4());
  const [searchAttempts, setSearchAttempts] = useState(0);
  
  const db = getDb();
  const typingTimeoutRef = useRef(null);
  const matchCheckIntervalRef = useRef(null);

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
    // Optionally auto-search for new partner after a delay
    setTimeout(() => {
      if (window.confirm('Your partner left. Would you like to find a new one?')) {
        handleSkip();
      } else {
        onLeaveRoom();
      }
    }, 1000);
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
      
      if (partnerData) {
        const [, partner] = partnerData;
        setPartnerConnected(partner.connected);
        setPartnerNickname(partner.nickname);
      }

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
    
    await remove(ref(db, `rooms/${roomId}/users/${userId}`));
    
    // Check if room should be deleted
    const roomSnapshot = await get(ref(db, `rooms/${roomId}`));
    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
      const remainingUsers = Object.keys(roomData.users || {}).filter(id => id !== userId);
      if (remainingUsers.length === 0) {
        await remove(ref(db, `rooms/${roomId}`));
      }
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
    };
  }, [roomId, isSearching, listenToRoom, setupDisconnectHandler, leaveRoom]);

  const sendMessage = async (text) => {
    if (!roomId || !text.trim()) return;

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
  };

  const sendImage = async (file) => {
    if (!roomId) return;

    // Show uploading message
    const tempId = Date.now();
    setMessages(prev => [...prev, {
      id: `temp-${tempId}`,
      senderId: userId,
      senderNickname: userProfile.nickname,
      text: 'Uploading image...',
      timestamp: tempId,
      type: 'text',
      isTemp: true
    }]);

    const result = await uploadImage(file);

    // Remove temp message
    setMessages(prev => prev.filter(m => m.id !== `temp-${tempId}`));

    if (result.success) {
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
      alert('Failed to upload image: ' + result.error);
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-7xl mb-6"
          >
            👻
          </motion.div>
          <h2 className="text-2xl font-bold mb-3 text-ghost-accent">Finding your match...</h2>
          <p className="text-gray-400 mb-6 text-sm">
            {searchAttempts === 0 ? 'Initializing matchmaking...' : searchAttempts < 5 ? 'Looking for someone with similar interests...' : `Still searching... (${searchAttempts}s)`}
          </p>
          <div className="flex gap-2 justify-center mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full shadow-lg"
              />
            ))}
          </div>
          <button
            onClick={onLeaveRoom}
            className="btn-secondary w-full py-3"
          >
            Cancel Search
          </button>
          <p className="text-xs text-gray-600 mt-4">
            Tip: Add interest tags for better matches!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Header - Telegram style */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar circle */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold shadow-md ${
            partnerConnected ? 'bg-gradient-to-br from-sky-500 to-sky-600' : 'bg-slate-600'
          }`}>
            👻
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base truncate">{partnerNickname || 'Ghost User'}</span>
            </div>
            {partnerTyping ? (
              <span className="text-sm text-sky-400 animate-pulse">typing...</span>
            ) : (
              <span className={`text-xs ${partnerConnected ? 'text-green-400' : 'text-gray-500'}`}>
                {partnerConnected ? 'online' : 'offline'}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all text-sm font-medium"
            title="Skip to next person"
          >
            ⏭️ Next
          </button>
          <button
            onClick={onLeaveRoom}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-all text-sm font-medium"
            title="Leave chat"
          >
            ❌ Leave
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={userId} />

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
