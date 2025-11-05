import { useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

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
    <div className="bg-slate-800 border-t border-slate-700 p-4">
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
          className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload image"
        >
          {isUploading ? '⏳' : '📷'}
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
            placeholder="Type a message..."
            className="input-field resize-none min-h-[44px] max-h-32 pr-10"
            rows={1}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
            title="Add emoji"
          >
            😊
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isUploading}
          className="p-3 rounded-lg bg-ghost-accent hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          title="Send message"
        >
          📤
        </button>
      </form>

      {/* Character counter (optional) */}
      {message.length > 0 && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {message.length} / 1000
        </div>
      )}
    </div>
  );
}

export default MessageInput;
