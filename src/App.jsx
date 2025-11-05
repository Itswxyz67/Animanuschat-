import { useState, useEffect } from 'react';
import { initializeFirebase } from './services/firebase';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import { getNickname } from './utils/nickname';

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

  const getThemeEmoji = (themeName) => {
    const emojiMap = {
      dark: '🌙',
      light: '☀️',
      midnight: '🌃',
      sunset: '🌅',
      ocean: '🌊',
      forest: '🌲',
      neon: '⚡',
      dracula: '🧛'
    };
    return emojiMap[themeName] || '🎨';
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
      {/* Settings Button - Always visible */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleSettings}
          className="p-3 rounded-xl bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform"
          aria-label="Open settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={toggleSettings}
        >
          <div 
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent">⚙️ Settings</h2>
              <button
                onClick={toggleSettings}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-200">🎨 Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      onClick={() => changeTheme(t)}
                      className={`px-4 py-3 rounded-xl capitalize font-medium transition-all transform hover:scale-105 ${
                        theme === t
                          ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30'
                          : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                      }`}
                    >
                      {getThemeEmoji(t)} {t}
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
        <LandingPage onStartChat={handleStartChat} />
      )}

      {(currentScreen === 'searching' || currentScreen === 'chatting') && (
        <ChatRoom
          userProfile={userProfile}
          roomId={roomId}
          onRoomFound={handleRoomFound}
          onLeaveRoom={handleLeaveRoom}
          onSkip={handleSkip}
          isSearching={currentScreen === 'searching'}
        />
      )}
    </div>
  );
}

export default App;
