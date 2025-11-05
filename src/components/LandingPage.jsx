import { useState } from 'react';
import { motion } from 'framer-motion';

function LandingPage({ onStartChat }) {
  const [gender, setGender] = useState('');
  const [genderPreference, setGenderPreference] = useState('any');
  const [tags, setTags] = useState('');
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [showNsfwWarning, setShowNsfwWarning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!gender) {
      alert('Please select your gender');
      return;
    }

    // Show NSFW warning if enabling NSFW for first time
    if (nsfwEnabled && !showNsfwWarning) {
      setShowNsfwWarning(true);
      return;
    }

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    onStartChat({
      gender,
      genderPreference,
      tags: tagArray,
      nsfwEnabled
    });
  };

  const confirmNsfw = () => {
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    onStartChat({
      gender,
      genderPreference,
      tags: tagArray,
      nsfwEnabled: true
    });
  };

  if (showNsfwWarning) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">NSFW Content Warning</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              You are about to enable NSFW mode. This means:
            </p>
            <ul className="text-left text-gray-300 text-sm mt-4 space-y-2">
              <li>• You may encounter adult content</li>
              <li>• You will only be matched with others who have NSFW enabled</li>
              <li>• Content filters will be more permissive</li>
              <li>• You must be 18+ years old</li>
            </ul>
            <p className="text-gray-400 text-xs mt-4">
              By continuing, you confirm you are 18 years or older and consent to viewing adult content.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNsfwWarning(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmNsfw}
              className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              I&apos;m 18+, Continue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl mb-4"
          >
            👻
          </motion.div>
          <h1 className="text-4xl font-bold text-ghost-accent mb-2">GhostLink</h1>
          <p className="text-gray-400">Anonymous 1-on-1 Random Chat</p>
          <p className="text-sm text-gray-500 mt-2">No login • No tracking • Completely free</p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-2xl p-8 shadow-2xl space-y-6"
        >
          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Your Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {['male', 'female', 'other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-lg capitalize font-medium transition-all ${
                    gender === g
                      ? 'bg-ghost-accent text-white scale-105'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-medium mb-3">Looking for</label>
            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className="input-field"
            >
              <option value="any">Anyone</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Interest Tags */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Interests <span className="text-gray-500 text-xs">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., gaming, music, anime, tech"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              You&apos;ll be matched with people who share similar interests
            </p>
          </div>

          {/* NSFW Toggle */}
          <div className="border-t border-slate-700 pt-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="block font-medium">Enable NSFW Mode</span>
                <span className="text-xs text-gray-500">18+ only, adult content allowed</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={nsfwEnabled}
                  onChange={(e) => setNsfwEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-red-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full btn-primary text-lg py-3 font-semibold"
          >
            🚀 Start Chatting
          </button>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-gray-500">
            Your messages are temporary and deleted when you disconnect. We don&apos;t collect any personal data.
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default LandingPage;
