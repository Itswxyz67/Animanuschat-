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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full card-glass p-10 shadow-2xl border-2 border-red-500/30"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-6"
            >
              ⚠️
            </motion.div>
            <h2 className="text-3xl font-black text-red-400 mb-4 gradient-text">NSFW Content Warning</h2>
            <p className="text-gray-300 text-base leading-relaxed font-semibold">
              You are about to enable NSFW mode. This means:
            </p>
            <ul className="text-left text-gray-300 text-sm mt-6 space-y-3 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl font-bold">•</span>
                <span className="font-semibold">You may encounter adult content</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl font-bold">•</span>
                <span className="font-semibold">You will only be matched with others who have NSFW enabled</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl font-bold">•</span>
                <span className="font-semibold">Content filters will be more permissive</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl font-bold">•</span>
                <span className="font-black text-red-300">You must be 18+ years old</span>
              </li>
            </ul>
            <p className="text-gray-300 text-sm mt-6 bg-red-900/30 backdrop-blur-sm p-4 rounded-2xl font-semibold border border-red-500/30">
              By continuing, you confirm you are 18 years or older and consent to viewing adult content.
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowNsfwWarning(false)}
              className="flex-1 btn-secondary py-4 text-base font-bold"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={confirmNsfw}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-4 rounded-2xl font-black text-base transition-all shadow-2xl shadow-red-600/40 hover:shadow-red-600/60"
            >
              I&apos;m 18+, Continue
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
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
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl mb-6 inline-block"
          >
            <div className="relative">
              <IoChatbubbles className="text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-60 animate-pulse"></div>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black gradient-text mb-4 tracking-tight drop-shadow-lg"
          >
            GhostLink
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-xl flex items-center justify-center gap-2.5 mb-6 font-bold"
          >
            <HiSparkles className="text-purple-400 text-2xl" />
            Anonymous 1-on-1 Random Chat
            <HiSparkles className="text-purple-400 text-2xl" />
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-sm text-gray-400"
          >
            <motion.span
              whileHover={{ scale: 1.08, y: -2 }}
              className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg font-semibold"
            >
              <IoLockClosed className="text-indigo-400 text-lg" /> No login
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.08, y: -2 }}
              className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg font-semibold"
            >
              <FaUserSecret className="text-purple-400 text-lg" /> Anonymous
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.08, y: -2 }}
              className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg font-semibold"
            >
              <IoShieldCheckmark className="text-pink-400 text-lg" /> Free
            </motion.span>
          </motion.div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="card-glass p-10 space-y-6"
        >
          {/* Gender Selection */}
          <div>
            <label className="block text-base font-black mb-4 gradient-text">Your Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {['male', 'female', 'other'].map((g) => (
                <motion.button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-4 rounded-2xl capitalize font-bold text-base transition-all shadow-lg ${
                    gender === g
                      ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 border-0'
                      : 'bg-slate-700/60 backdrop-blur-md hover:bg-slate-600/70 text-gray-300 border-2 border-slate-600/40'
                  }`}
                >
                  <span className="text-2xl">{g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'}</span>
                  <br />
                  <span className="text-sm">{g}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-base font-black mb-4 gradient-text">Looking for</label>
            <select
              value={genderPreference}
              onChange={(e) => setGenderPreference(e.target.value)}
              className="input-field font-semibold cursor-pointer py-4 text-base shadow-lg hover:shadow-xl transition-all"
            >
              <option value="any">Anyone 🌟</option>
              <option value="male">Male 👨</option>
              <option value="female">Female 👩</option>
              <option value="other">Other 🧑</option>
            </select>
          </div>

          {/* Interest Tags */}
          <div>
            <label className="block text-base font-black mb-4 gradient-text">
              Interests <span className="text-gray-400 text-sm font-semibold">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., gaming, music, anime, tech"
              className="input-field font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all"
            />
            <p className="text-sm text-gray-400 mt-3 flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-4 py-2.5 rounded-xl">
              <HiSparkles className="text-purple-400 text-lg" />
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
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full btn-primary text-xl py-5 flex items-center justify-center gap-3 mt-8 font-black shadow-2xl"
          >
            <FaRocket className="text-2xl" /> Start Chatting
          </motion.button>

          {/* Privacy Notice */}
          <div className="text-center space-y-3 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-gray-300 leading-relaxed flex items-center justify-center gap-2 font-semibold">
              <IoLockClosed className="text-indigo-400 text-lg" /> Your privacy is protected. Messages are temporary.
            </p>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2 font-semibold">
              <IoShieldCheckmark className="text-pink-400 text-lg" /> We don&apos;t collect any personal data.
            </p>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2 bg-slate-800/40 backdrop-blur-sm px-4 py-2 rounded-xl">
              <HiSparkles className="text-purple-400 text-lg" /> Use ||text|| for spoilers that reveal on click
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default LandingPage;
