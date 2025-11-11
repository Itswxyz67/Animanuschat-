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
    <div className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-700/50 px-4 py-4 shadow-2xl">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={300}
            height={400}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Image Upload Button */}
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-2xl bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl border border-slate-600/50"
          title="Upload image"
        >
          {isUploading ? <BiLoaderAlt className="animate-spin" /> : <IoImage />}
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full px-5 py-3.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-ghost-text resize-none min-h-[52px] max-h-32 pr-14 transition-all font-medium placeholder-slate-500"
            rows={1}
            disabled={isUploading}
          />
          <motion.button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform text-purple-400"
            title="Add emoji"
          >
            <IoHappy />
          </motion.button>
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!message.trim() || isUploading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 font-semibold shadow-2xl shadow-purple-500/50"
          title="Send message"
        >
          <IoSend className="w-5 h-5" />
        </motion.button>
      </form>

      {/* Character counter - only show when getting close to limit */}
      {message.length > 800 && (
        <div className={`text-xs mt-1.5 text-right ${message.length > 950 ? 'text-red-400' : 'text-gray-500'}`}>
          {message.length} / 1000
        </div>
      )}
    </div>
  );
}

export default MessageInput;
