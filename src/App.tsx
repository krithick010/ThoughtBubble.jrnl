import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ThoughtBubble, Mood } from './types';
import { initialBubbles } from './data/initialBubbles';
import BubbleList from './components/BubbleList';
import NewBubblePage from './components/NewBubblePage';
import EditBubblePage from './components/EditBubblePage';

function App() {
  const [bubbles, setBubbles] = useState<ThoughtBubble[]>(() => {
    const savedBubbles = localStorage.getItem('thoughtBubbles');
    return savedBubbles ? JSON.parse(savedBubbles) : initialBubbles;
  });

  useEffect(() => {
    localStorage.setItem('thoughtBubbles', JSON.stringify(bubbles));
  }, [bubbles]);

  const handleNewBubble = (bubbleData: Omit<ThoughtBubble, 'id' | 'timestamp'>) => {
    const newBubble: ThoughtBubble = {
      ...bubbleData,
      id: `bubble_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
    };
    setBubbles([newBubble, ...bubbles]);
  };

  const handleDeleteBubble = (id: string) => {
    setBubbles(bubbles.filter(bubble => bubble.id !== id));
  };

  const handleEditBubble = (id: string, newContent: string) => {
    const updatedBubbles = bubbles.map(bubble =>
      bubble.id === id ? { ...bubble, content: newContent } : bubble
    );
    setBubbles(updatedBubbles);
  };

  const handleSaveBubble = (id: string, content: string, mood: Mood) => {
    const updatedBubbles = bubbles.map(bubble =>
      bubble.id === id ? { ...bubble, content, mood } : bubble
    );
    setBubbles(updatedBubbles);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-600 to-blue-800 overflow-hidden relative">
              {/* Sky Background Effects */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Fluffy cloud elements */}
                <div className="absolute top-[5%] left-[10%] w-[30%] h-[15%] rounded-[50%] bg-white/40 blur-[30px]"
                  style={{ animation: 'float1 80s infinite alternate ease-in-out' }}></div>
                <div className="absolute top-[15%] right-[15%] w-[40%] h-[20%] rounded-[50%] bg-white/30 blur-[50px]"
                  style={{ animation: 'float2 100s infinite alternate-reverse ease-in-out' }}></div>
                <div className="absolute top-[35%] left-[25%] w-[35%] h-[12%] rounded-[50%] bg-white/25 blur-[40px]"
                  style={{ animation: 'float3 90s infinite alternate ease-in-out' }}></div>
                <div className="absolute top-[55%] right-[30%] w-[25%] h-[10%] rounded-[50%] bg-white/20 blur-[35px]"
                  style={{ animation: 'float1 110s infinite alternate ease-in-out' }}></div>
                
                {/* Small bubbles floating up from bottom */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const size = Math.random() * 15 + 5;
                  const delay = Math.random() * 30;
                  const duration = Math.random() * 15 + 15;
                  const horizontal = Math.random() * 80 + 10;

                  return (
                    <div
                      key={`bubble-${i}`}
                      className="absolute rounded-full bg-white/10 backdrop-blur-[1px] border border-white/30"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        bottom: `-${size}px`,
                        left: `${horizontal}%`,
                        animation: `bubble-float ${duration}s ${delay}s infinite linear`,
                        boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5), 0 0 5px rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  );
                })}

                {/* Stars */}
                {Array.from({ length: 150 }).map((_, i) => {
                  const size = Math.random() * 2 + 1;
                  const twinkleSpeed = Math.random() * 5 + 3;
                  const twinkleDelay = Math.random() * 5;

                  return (
                    <div
                      key={`star-${i}`}
                      className="absolute bg-white rounded-full"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.5 + 0.25,
                        animation: `twinkle ${twinkleSpeed}s ${twinkleDelay}s infinite ease-in-out`,
                      }}
                    />
                  );
                })}

                {/* Shooting stars */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`shooting-star-${i}`}
                    className="absolute bg-gradient-to-r from-white to-transparent"
                    style={{
                      width: '50px',
                      height: '1px',
                      top: `${Math.random() * 50 + 5}%`,
                      left: '0%',
                      opacity: 0,
                      transform: 'rotate(-15deg)',
                      animation: `shooting-star 10s ${15 * i}s infinite linear`,
                    }}
                  />
                ))}
              </div>

              {/* Header */}
              <header className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-md">
                <div className="absolute inset-0 bg-black/80 shadow-[0_0_15px_rgba(66,153,225,0.6),0_0_30px_rgba(56,178,172,0.4)]"></div>
                <div className="w-full px-6 py-4 flex justify-between items-center relative z-10">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 drop-shadow-[0_0_5px_rgba(56,178,172,0.8)]">
                      Thought Bubble AI
                    </h1>
                    <span className="ml-3 text-sm bg-black/40 text-cyan-100 px-3 py-1 rounded-full border border-cyan-400/50 shadow-[0_0_5px_rgba(56,178,172,0.5)]">
                      {bubbles.length} {bubbles.length === 1 ? 'bubble' : 'bubbles'}
                    </span>
                  </div>
                  <Link
                    to="/new"
                    className="group relative flex items-center gap-2 bg-black/50 border border-cyan-400/40 text-cyan-100 px-5 py-2.5 rounded-lg hover:text-white transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-sm"></div>
                    <div className="relative z-10 p-1 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500/40 transition-colors">
                      <Plus className="w-4 h-4 text-cyan-300 group-hover:text-cyan-100" />
                    </div>
                    <span className="relative z-10 text-cyan-100 group-hover:text-white transition-colors">
                      New Bubble
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-px transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_10px_rgba(56,178,172,0.8)]"></div>
                  </Link>
                </div>
              </header>

              <main className="w-full pt-16 relative z-10">
                <BubbleList bubbles={bubbles} onDelete={handleDeleteBubble} onEdit={handleEditBubble} />
              </main>
            </div>
          }
        />
        <Route path="/new" element={<NewBubblePage onSubmit={handleNewBubble} />} />
        <Route
          path="/edit/:id"
          element={
            <EditBubblePage
              onSave={handleSaveBubble}
              onDelete={handleDeleteBubble}
              bubbles={bubbles}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
