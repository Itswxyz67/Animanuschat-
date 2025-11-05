import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-4xl mb-2">👋</p>
          <p>Say hi to start the conversation!</p>
        </div>
      )}

      <AnimatePresence>
        {messages.map((message) => {
          const isSent = message.senderId === currentUserId;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%]`}>
                {/* Nickname */}
                {!isSent && (
                  <div className="text-xs text-gray-400 mb-1 ml-2">
                    {message.senderNickname}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`message-bubble ${
                    isSent ? 'message-sent' : 'message-received'
                  } ${message.isTemp ? 'opacity-50' : ''}`}
                >
                  {message.type === 'text' && (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  )}

                  {message.type === 'image' && message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-1 ${
                      isSent ? 'text-sky-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
