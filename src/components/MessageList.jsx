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
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-4xl mb-3">👋</p>
          <p className="text-base">Say hi to start the conversation!</p>
          <p className="text-xs text-gray-600 mt-2">Your messages are end-to-end temporary</p>
        </div>
      )}

      <AnimatePresence>
        {messages.map((message) => {
          const isSent = message.senderId === currentUserId;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1`}
            >
              <div className={`max-w-[75%] md:max-w-[65%]`}>
                {/* Nickname - only for received messages */}
                {!isSent && (
                  <div className="text-xs font-medium text-sky-400 mb-1 ml-3">
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
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>
                  )}

                  {message.type === 'image' && message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-1 ${
                      isSent ? 'text-sky-100 opacity-80' : 'text-gray-500'
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
