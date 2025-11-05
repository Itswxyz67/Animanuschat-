import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoLockClosed, IoShieldCheckmark, IoChatbubbles } from 'react-icons/io5';
import { FaRocket, FaUserSecret } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

function LandingPage({ onStartChat }) {
  // Load saved preferences from localStorage
  const [gender, setGender] = useState(() => localStorage.getItem('ghostlink_gender') || '');
  const [genderPreference, setGenderPreference] = useState(() => localStorage.getItem('ghostlink_genderPreference') || 'any');
  const [tags, setTags] = useState(() => localStorage.getItem('ghostlink_tags') || '');
  const [nsfwEnabled, setNsfwEnabled] = useState(() => localStorage.getItem('ghostlink_nsfw') === 'true');
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

    // Save preferences to localStorage
    localStorage.setItem('ghostlink_gender', gender);
    localStorage.setItem('ghostlink_genderPreference', genderPreference);
    localStorage.setItem('ghostlink_tags', tags);
    localStorage.setItem('ghostlink_nsfw', nsfwEnabled);

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
    // Save preferences to localStorage
    localStorage.setItem('ghostlink_gender', gender);
    localStorage.setItem('ghostlink_genderPreference', genderPreference);
    localStorage.setItem('ghostlink_tags', tags);
    localStorage.setItem('ghostlink_nsfw', 'true');

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-red-900/50"
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-3">NSFW Content Warning</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              You are about to enable NSFW mode. This means:
            </p>
            <ul className="text-left text-gray-300 text-sm mt-4 space-y-2.5 bg-slate-900/50 p-4 rounded-xl">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>You may encounter adult content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>You will only be matched with others who have NSFW enabled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Content filters will be more permissive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span className="font-semibold">You must be 18+ years old</span>
              </li>
            </ul>
            <p className="text-gray-400 text-xs mt-4 bg-red-900/20 p-3 rounded-lg">
              By continuing, you confirm you are 18 years or older and consent to viewing adult content.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNsfwWarning(false)}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              onClick={confirmNsfw}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-600/30"
            >
              I&apos;m 18+, Continue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl mb-4 inline-block"
          >
            <IoChatbubbles className="text-sky-500" />
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 via-purple-500 to-sky-600 bg-clip-text text-transparent mb-3 animate-gradient">GhostLink</h1>
          <p className="text-gray-300 text-lg flex items-center justify-center gap-2">
            <HiSparkles className="text-sky-400" />
            Anonymous 1-on-1 Random Chat
            <HiSparkles className="text-sky-400" />
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-400 mt-4">
            <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-full">
              <IoLockClosed className="text-sky-400" /> No login
            </span>
            <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-full">
              <FaUserSecret className="text-purple-400" /> Anonymous
            </span>
            <span className="flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-full">
              <IoShieldCheckmark className="text-green-400" /> Free
            </span>
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50 space-y-6"
        >
          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">Your Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {['male', 'female', 'other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-xl capitalize font-medium transition-all ${
                    gender === g
                      ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white scale-105 shadow-lg shadow-sky-500/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                  }`}
                >
                  {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">Looking for</label>
            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className="input-field bg-slate-700 border-slate-600"
            >
              <option value="any">Anyone</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Interest Tags */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-200">
              Interests <span className="text-gray-500 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., gaming, music, anime, tech"
              className="input-field bg-slate-700 border-slate-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Add interests to match with people who share your hobbies
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
            className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-lg py-4 rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <FaRocket className="text-xl" /> Start Chatting
          </button>

          {/* Privacy Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500 leading-relaxed flex items-center justify-center gap-1">
              <IoLockClosed className="text-sky-400" /> Your privacy is protected. Messages are temporary and deleted when you disconnect.
            </p>
            <p className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
              <IoShieldCheckmark className="text-green-500" /> We don&apos;t collect any personal data.
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default LandingPage;
