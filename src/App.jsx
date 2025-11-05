import { useState, useEffect } from 'react';
import { initializeFirebase } from './services/firebase';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import { getNickname } from './utils/nickname';

const THEMES = ['dark', 'light', 'midnight', 'sunset'];

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing', 'searching', 'chatting'
  const [userProfile, setUserProfile] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
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
    setShowThemeSelector(false);
  };

  const toggleTheme = () => {
    setShowThemeSelector(!showThemeSelector);
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
      {/* Theme Selector - Always visible */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          aria-label="Change theme"
        >
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : theme === 'midnight' ? '🌃' : '🌅'}
        </button>
        
        {showThemeSelector && (
          <div className="absolute top-12 right-0 bg-slate-800 rounded-lg shadow-xl p-2 min-w-[150px]">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => changeTheme(t)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-slate-700 transition-colors capitalize ${
                  theme === t ? 'bg-slate-700 text-sky-400' : ''
                }`}
              >
                {t === 'dark' ? '🌙 Dark' : t === 'light' ? '☀️ Light' : t === 'midnight' ? '🌃 Midnight' : '🌅 Sunset'}
              </button>
            ))}
          </div>
        )}
      </div>

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
