import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoLockClosed, IoShieldCheckmark, IoChatbubbles, IoSettingsSharp } from 'react-icons/io5';
import { FaRocket, FaUserSecret } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

function LandingPage({ onStartChat, onOpenSettings }) {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full relative z-10"
      >
        {/* Settings Button - Top Right */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="p-3 rounded-2xl bg-slate-800/50 backdrop-blur-xl hover:bg-slate-700/50 transition-all shadow-xl border border-slate-700/50 text-lg"
            aria-label="Open settings"
          >
            <IoSettingsSharp />
          </motion.button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-6xl mb-4 inline-block"
          >
            <div className="relative">
              <IoChatbubbles className="text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-50"></div>
            </div>
          </motion.div>
          <h1 className="text-5xl font-black gradient-text mb-3 tracking-tight">
            GhostLink
          </h1>
          <p className="text-gray-300 text-lg flex items-center justify-center gap-2 mb-4 font-medium">
            <HiSparkles className="text-purple-400" />
            Anonymous 1-on-1 Random Chat
            <HiSparkles className="text-purple-400" />
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 bg-slate-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50"
            >
              <IoLockClosed className="text-indigo-400" /> No login
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 bg-slate-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50"
            >
              <FaUserSecret className="text-purple-400" /> Anonymous
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 bg-slate-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50"
            >
              <IoShieldCheckmark className="text-pink-400" /> Free
            </motion.span>
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="card-glass p-8 space-y-5"
        >
          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-bold mb-3 gradient-text">Your Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {['male', 'female', 'other'].map((g) => (
                <motion.button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-3.5 rounded-2xl capitalize font-semibold transition-all ${
                    gender === g
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/40 border-0'
                      : 'bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 text-gray-300 border border-slate-600/50'
                  }`}
                >
                  {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-sm font-bold mb-3 gradient-text">Looking for</label>
            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className="input-field font-medium cursor-pointer"
            >
              <option value="any">Anyone</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Interest Tags */}
          <div>
            <label className="block text-sm font-bold mb-3 gradient-text">
              Interests <span className="text-gray-500 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., gaming, music, anime, tech"
              className="input-field font-medium"
            />
            <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
              <HiSparkles className="text-purple-400" />
              Add interests to match with people who share your hobbies
            </p>
          </div>

          {/* NSFW Toggle */}
          <div className="border-t border-slate-700/50 pt-5">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="block font-semibold text-gray-200">Enable NSFW Mode</span>
                <span className="text-xs text-gray-400">18+ only, adult content allowed</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={nsfwEnabled}
                  onChange={(e) => setNsfwEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-700/50 backdrop-blur-sm rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-pink-500 transition-all border border-slate-600/50 peer-checked:border-transparent shadow-lg"></div>
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-lg"></div>
              </div>
            </label>
          </div>

          {/* Start Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2.5 mt-6"
          >
            <FaRocket className="text-xl" /> Start Chatting
          </motion.button>

          {/* Privacy Notice */}
          <div className="text-center space-y-2 pt-2">
            <p className="text-xs text-gray-400 leading-relaxed flex items-center justify-center gap-1.5">
              <IoLockClosed className="text-indigo-400" /> Your privacy is protected. Messages are temporary.
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
              <IoShieldCheckmark className="text-pink-400" /> We don&apos;t collect any personal data.
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
              <HiSparkles className="text-purple-400" /> Use ||text|| for spoilers that reveal on click
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default LandingPage;
