import { useState, useEffect } from 'react';
import { initializeFirebase } from './services/firebase';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import { getNickname } from './utils/nickname';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing', 'searching', 'chatting'
  const [userProfile, setUserProfile] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [theme, setTheme] = useState('dark');
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
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ghostlink_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
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
      {/* Theme Toggle - Always visible */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>

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
