import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { motion } from 'framer-motion';
import { IoSend, IoHappy, IoImage } from 'react-icons/io5';
import { BiLoaderAlt } from 'react-icons/bi';

function MessageInput({ onSendMessage, onSendImage, onTyping }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !isUploading) {
      onSendMessage(message.trim());
      setMessage('');
      onTyping(false);
      
      // Reset textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    onTyping(value.length > 0);

    // Auto-resize textarea
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textAreaRef.current?.focus();
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    await onSendImage(file);
    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl border-t border-slate-700/50 px-6 py-5 shadow-2xl relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowEmojiPicker(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-6 z-50 shadow-2xl rounded-3xl overflow-hidden"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width={320}
              height={420}
            />
          </motion.div>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Image Upload Button */}
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.92 }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-md hover:from-slate-600/70 hover:to-slate-700/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl border border-slate-600/30 shadow-lg hover:shadow-xl hover:shadow-purple-500/10"
          title="Upload image"
        >
          {isUploading ? <BiLoaderAlt className="animate-spin text-purple-400" /> : <IoImage className="text-purple-300" />}
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Text Input */}
        <div className="flex-1 relative group">
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send)"
            className="w-full px-6 py-4 bg-slate-800/60 backdrop-blur-md border-2 border-slate-700/40 rounded-[28px] focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 text-ghost-text resize-none min-h-[56px] max-h-36 pr-16 transition-all font-medium placeholder-slate-400 shadow-lg hover:border-slate-600/50 group-hover:shadow-xl"
            rows={1}
            disabled={isUploading}
          />
          <motion.button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.85 }}
            className={`absolute right-5 top-1/2 -translate-y-1/2 text-2xl transition-all ${
              showEmojiPicker ? 'text-yellow-400 scale-110' : 'text-purple-400 hover:text-purple-300'
            }`}
            title="Add emoji"
          >
            <IoHappy />
          </motion.button>
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!message.trim() || isUploading}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={message.trim() ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: message.trim() ? Infinity : 0, repeatDelay: 2 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:from-slate-700/50 disabled:to-slate-700/50 disabled:scale-100 font-semibold shadow-2xl shadow-purple-500/60 hover:shadow-purple-500/80 hover:shadow-2xl"
          title="Send message"
        >
          <IoSend className="w-5 h-5" />
        </motion.button>
      </form>

      {/* Character counter - only show when getting close to limit */}
      {message.length > 800 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xs mt-2 text-right font-semibold ${message.length > 950 ? 'text-red-400' : 'text-gray-400'}`}
        >
          {message.length} / 1000
        </motion.div>
      )}
    </div>
  );
}

export default MessageInput;
