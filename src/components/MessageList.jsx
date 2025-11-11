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
                  {message.type === 'text' && (() => {
                    const embedData = detectEmbedType(message.text);
                    const textParts = parseTextWithSpoilers(message.text);
                    
                    return (
                      <>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed mb-2">
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

      {/* Typing Indicator Bubble */}
      {partnerTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex justify-start mb-1"
        >
          <div className="max-w-[75%] md:max-w-[65%]">
            <div className="text-xs font-medium text-sky-400 mb-1 ml-3">
              {partnerNickname || 'Partner'}
            </div>
            <div className="message-bubble message-received">
              <div className="flex gap-1 py-1">
                <span className="typing-dot" style={{ animationDelay: '0ms' }}>•</span>
                <span className="typing-dot" style={{ animationDelay: '200ms' }}>•</span>
                <span className="typing-dot" style={{ animationDelay: '400ms' }}>•</span>
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
