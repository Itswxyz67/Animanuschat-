import { useState, useEffect } from 'react';
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={toggleSettings}
        >
          <div 
            className="card-glass max-w-md w-full p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black gradient-text flex items-center gap-3">
                <IoSettingsSharp /> Settings
              </h2>
              <button
                onClick={toggleSettings}
                className="text-gray-400 hover:text-white transition-colors text-3xl hover:rotate-90 transform duration-300"
                aria-label="Close settings"
              >
                <IoClose />
              </button>
            </div>
            
            <div className="space-y-7">
              {/* Theme Selection */}
              <div>
                <h3 className="text-xl font-bold mb-4 gradient-text flex items-center gap-2">
                  <RiChatSmile3Fill /> Theme
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => changeTheme(t)}
                      className={`px-4 py-3.5 rounded-2xl capitalize font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                        theme === t
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/40'
                          : 'bg-slate-700/50 backdrop-blur-sm hover:bg-slate-600/50 text-gray-300 border border-slate-600/50'
                      }`}
                    >
                      <span className="text-lg">{getThemeIcon(t)}</span> {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Preview */}
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-400">Preview</h3>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
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
              <div className="border-t border-slate-700 pt-4 text-center">
                <p className="text-sm text-gray-400">
                  GhostLink v1.0.0
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Anonymous • Secure • Free
                </p>
              </div>
            </div>
          </div>
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
