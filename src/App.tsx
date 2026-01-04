
import { GameWrapper } from './ui/GameWrapper';
import { EventBus } from './game/EventBus';

function App() {
  const handleTestClick = () => {
    EventBus.emit('test-connection');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Phaser Game Layer (z-0) */}
      <div className="absolute inset-0 z-0">
        <GameWrapper />
      </div>

      {/* UI Overlay Layer (z-10) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-8 pointer-events-auto">
          Velkommen til spillet
        </h1>

        <button
          onClick={handleTestClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105 pointer-events-auto"
        >
          Test Kobling
        </button>
      </div>
    </div>
  );
}

export default App;
