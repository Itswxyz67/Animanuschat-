import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { initializeFirebase } from './services/firebase';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import { getNickname } from './utils/nickname';
import { IoSettingsSharp, IoClose, IoMoon, IoSunny, IoWater, IoLeaf } from 'react-icons/io5';
import { RiChatSmile3Fill } from 'react-icons/ri';
import { BsLightningChargeFill } from 'react-icons/bs';
import { GiNightSky, GiSunset, GiVampireDracula } from 'react-icons/gi';

const THEMES = ['dark', 'light', 'midnight', 'sunset', 'ocean', 'forest', 'neon', 'dracula'];

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing', 'searching', 'chatting'
  const [userProfile, setUserProfile] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase
    const result = initializeFirebase();
    if (result.success) {
      setFirebaseReady(true);
    } else {
      console.error('Failed to initialize Firebase. Please check your configuration.');
      // For demo/development purposes only - allows UI testing without Firebase
      if (import.meta.env.DEV) {
        setTimeout(() => setFirebaseReady(true), 1000);
      }
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('ghostlink_theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName) => {
    // Remove all theme classes
    THEMES.forEach(t => document.documentElement.classList.remove(t));
    // Add the selected theme class
    document.documentElement.classList.add(themeName);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ghostlink_theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const getThemeIcon = (themeName) => {
    const iconMap = {
      dark: <IoMoon />,
      light: <IoSunny />,
      midnight: <GiNightSky />,
      sunset: <GiSunset />,
      ocean: <IoWater />,
      forest: <IoLeaf />,
      neon: <BsLightningChargeFill />,
      dracula: <GiVampireDracula />
    };
    return iconMap[themeName] || <RiChatSmile3Fill />;
  };

  const handleStartChat = (profile) => {
    const nickname = getNickname();
    setUserProfile({ ...profile, nickname });
    setCurrentScreen('searching');
  };

  const handleRoomFound = (newRoomId) => {
    setRoomId(newRoomId);
    setCurrentScreen('chatting');
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setCurrentScreen('landing');
    setUserProfile(null);
  };

  const handleSkip = () => {
    setRoomId(null);
    setCurrentScreen('searching');
  };

  if (!firebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👻</div>
          <p className="text-xl">Initializing GhostLink...</p>
          <p className="text-sm text-gray-400 mt-2">
            Make sure Firebase is configured properly
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Settings Panel */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={toggleSettings}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card-glass max-w-md w-full p-10 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-black gradient-text flex items-center gap-3">
                <IoSettingsSharp /> Settings
              </h2>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSettings}
                className="text-gray-400 hover:text-white transition-colors text-3xl"
                aria-label="Close settings"
              >
                <IoClose />
              </motion.button>
            </div>
            
            <div className="space-y-8">
              {/* Theme Selection */}
              <div>
                <h3 className="text-2xl font-black mb-5 gradient-text flex items-center gap-2">
                  <RiChatSmile3Fill /> Theme
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <motion.button
                      key={t}
                      onClick={() => changeTheme(t)}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-5 py-4 rounded-2xl capitalize font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                        theme === t
                          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50'
                          : 'bg-slate-700/60 backdrop-blur-md hover:bg-slate-600/70 text-gray-300 border-2 border-slate-600/40'
                      }`}
                    >
                      <span className="text-xl">{getThemeIcon(t)}</span> {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Theme Preview */}
              <div className="border-t-2 border-slate-700/50 pt-6">
                <h3 className="text-base font-bold mb-4 text-gray-300">Preview</h3>
                <div className="bg-slate-700/50 backdrop-blur-md rounded-2xl p-5 space-y-3">
                  <div className="flex justify-end">
                    <div className="message-bubble message-sent max-w-[70%]">
                      Your message looks like this! 👋
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="message-bubble message-received max-w-[70%]">
                      Partner&apos;s message appears here 💬
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="border-t-2 border-slate-700/50 pt-6 text-center">
                <p className="text-base text-gray-300 font-bold">
                  GhostLink v1.0.0
                </p>
                <p className="text-sm text-gray-400 mt-2 font-semibold">
                  Anonymous • Secure • Free
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {currentScreen === 'landing' && (
        <LandingPage onStartChat={handleStartChat} onOpenSettings={toggleSettings} />
      )}

      {(currentScreen === 'searching' || currentScreen === 'chatting') && (
        <ChatRoom
          userProfile={userProfile}
          roomId={roomId}
          onRoomFound={handleRoomFound}
          onLeaveRoom={handleLeaveRoom}
          onSkip={handleSkip}
          isSearching={currentScreen === 'searching'}
          onOpenSettings={toggleSettings}
        />
      )}
    </div>
  );
}

export default App;
