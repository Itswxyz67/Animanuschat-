import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
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
    <div className="bg-slate-800 border-t border-slate-700 px-4 py-3 shadow-lg">
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

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          title="Upload image"
        >
          {isUploading ? <BiLoaderAlt className="animate-spin" /> : <IoImage />}
        </button>
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
            placeholder="Message..."
            className="w-full px-4 py-2.5 bg-slate-700 border-0 rounded-3xl focus:outline-none focus:ring-2 focus:ring-ghost-accent/30 text-ghost-text resize-none min-h-[44px] max-h-32 pr-12 transition-all"
            rows={1}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform text-yellow-400"
            title="Add emoji"
          >
            <IoHappy />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isUploading}
          className="p-3 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 font-semibold shadow-lg"
          title="Send message"
        >
          <IoSend className="w-5 h-5" />
        </button>
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
