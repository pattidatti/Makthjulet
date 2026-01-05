import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './ui/components/LandingPage';
import { AdminDashboard } from './ui/components/AdminDashboard';
import { GameSession } from './ui/GameSession';
import { useAudioStore } from './game/state/audioStore';
import { useEffect } from 'react';

function App() {
  const initAudio = useAudioStore(state => state.init);

  useEffect(() => {
    // Attempt init in effect (might be blocked, will retry on click)
    initAudio();
  }, [initAudio]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/play/:roomId" element={<GameSession />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
