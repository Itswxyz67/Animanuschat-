import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectEmbedType } from '../utils/embedParser';
import SpoilerText from './SpoilerText';

function MessageList({ messages, currentUserId, partnerTyping, partnerNickname }) {
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

  // Parse text for spoilers using ||spoiler|| syntax
  const parseTextWithSpoilers = (text) => {
    const spoilerRegex = /\|\|(.*?)\|\|/g;
    const parts = [];
    let lastIndex = 0;
    
    // Use matchAll for safer iteration
    const matches = [...text.matchAll(spoilerRegex)];
    
    matches.forEach((match) => {
      // Add text before spoiler
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Add spoiler
      parts.push({
        type: 'spoiler',
        content: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const renderEmbed = (embedData) => {
    if (!embedData) return null;

    switch (embedData.type) {
      case 'youtube':
        return (
          <div className="rounded-xl overflow-hidden">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${embedData.id}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="max-w-full"
            />
          </div>
        );
      
      case 'twitter':
        return (
          <div className="rounded-xl overflow-hidden bg-slate-600 p-3">
            <a 
              href={embedData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline text-sm"
            >
              View Tweet on Twitter/X →
            </a>
          </div>
        );
      
      case 'image':
        return (
          <img
            src={embedData.url}
            alt="Linked image"
            className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(embedData.url, '_blank')}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/95 backdrop-blur-sm">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-16 animate-fade-in">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-7xl mb-6 inline-block"
          >
            <div className="relative">
              <span className="text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text">👋</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-30"></div>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold gradient-text mb-2"
          >
            Start the conversation!
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-full inline-block"
          >
            🔒 Messages are temporary and private
          </motion.p>
        </div>
      )}

      <AnimatePresence>
        {messages.map((message) => {
          const isSent = message.senderId === currentUserId;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div className={`max-w-[80%] md:max-w-[70%] lg:max-w-[60%]`}>
                {/* Nickname - only for received messages */}
                {!isSent && (
                  <div className="text-xs font-bold text-indigo-400 mb-1.5 ml-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    {message.senderNickname}
                  </div>
                )}

                {/* Message Bubble */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`message-bubble ${
                    isSent ? 'message-sent' : 'message-received'
                  } ${message.isTemp ? 'opacity-50' : ''}`}
                >
                  {message.type === 'text' && (() => {
                    const embedData = detectEmbedType(message.text);
                    const textParts = parseTextWithSpoilers(message.text);
                    
                    return (
                      <>
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed mb-2">
                          {textParts.map((part, index) => {
                            if (part.type === 'spoiler') {
                              return <SpoilerText key={index}>{part.content}</SpoilerText>;
                            }
                            return <span key={index}>{part.content}</span>;
                          })}
                        </p>
                        {embedData && (
                          <div className="mt-2">
                            {renderEmbed(embedData)}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {message.type === 'image' && message.imageUrl && (
                    <motion.img
                      whileHover={{ scale: 1.02 }}
                      src={message.imageUrl}
                      alt="Shared image"
                      className="rounded-2xl max-w-full h-auto cursor-pointer hover:opacity-95 transition-all shadow-lg"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[11px] mt-2 font-medium ${
                      isSent ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Typing Indicator Bubble */}
      {partnerTyping && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start mb-2"
        >
          <div className="max-w-[80%] md:max-w-[70%] lg:max-w-[60%]">
            <div className="text-xs font-bold text-indigo-400 mb-1.5 ml-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              {partnerNickname || 'Partner'}
            </div>
            <div className="message-bubble message-received">
              <div className="flex gap-1.5 py-1">
                <span className="typing-dot" style={{ animationDelay: '0ms' }}>●</span>
                <span className="typing-dot" style={{ animationDelay: '200ms' }}>●</span>
                <span className="typing-dot" style={{ animationDelay: '400ms' }}>●</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
