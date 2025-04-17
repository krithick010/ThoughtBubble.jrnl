import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThoughtBubble, Mood } from './types';
import { v4 as uuidv4 } from 'uuid';
import BubbleList from './components/BubbleList';
import NewBubblePage from './components/NewBubblePage';
import EditBubblePage from './components/EditBubblePage';
import { getBubbles, saveBubbles } from './services/storage';
import { Plus, CloudyIcon } from 'lucide-react';

// Create a separate component for the home page to use the useNavigate hook
const HomePage = ({ bubbles, onDelete, onEdit }: {
  bubbles: ThoughtBubble[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newContent: string, mood: Mood) => void;
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-600 to-blue-800 overflow-hidden relative">
      {/* Sky Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Fluffy cloud elements */}
        <div
          className="absolute top-[5%] left-[10%] w-[30%] h-[15%] rounded-[50%] bg-white/40 blur-[30px]"
          style={{ animation: 'float1 80s infinite alternate ease-in-out' }}
        ></div>
        <div
          className="absolute top-[15%] right-[15%] w-[40%] h-[20%] rounded-[50%] bg-white/30 blur-[50px]"
          style={{ animation: 'float2 100s infinite alternate-reverse ease-in-out' }}
        ></div>
        <div
          className="absolute top-[35%] left-[25%] w-[35%] h-[12%] rounded-[50%] bg-white/25 blur-[40px]"
          style={{ animation: 'float3 90s infinite alternate ease-in-out' }}
        ></div>
        <div
          className="absolute top-[55%] right-[30%] w-[25%] h-[10%] rounded-[50%] bg-white/20 blur-[35px]"
          style={{ animation: 'float1 110s infinite alternate ease-in-out' }}
        ></div>

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
                boxShadow:
                  'inset 0 0 3px rgba(255, 255, 255, 0.5), 0 0 5px rgba(255, 255, 255, 0.2)',
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

          {/* Add New Thought Button */}
          <button
            onClick={() => navigate('/new')}
            className="px-4 py-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            <Plus className="h-5 w-5" />
            <span>New Thought</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Add this section to show a prominent "Create First Bubble" button when no bubbles exist */}
        {bubbles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <div className="flex items-center justify-center w-32 h-32 bg-purple-500/30 rounded-full mb-6 backdrop-blur-sm border border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              <CloudyIcon className="w-16 h-16 text-white/80" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No Thoughts Yet</h2>
            <p className="text-lg text-center max-w-md mb-8">
              Share what's on your mind and start a reflective conversation with AI
            </p>
            <button
              onClick={() => navigate('/new')}
              className="px-6 py-3 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30 text-lg font-medium"
            >
              <Plus className="h-6 w-6" />
              <span>Create First Thought</span>
            </button>
          </div>
        )}

        <BubbleList
          bubbles={bubbles}
          onDelete={onDelete}
          onEdit={(id, newContent) => {
            const bubble = bubbles.find(b => b.id === id);
            if (bubble) {
              onEdit(id, newContent, bubble.mood);
            }
          }}
        />
      </main>

      {/* Floating action button for adding new thoughts (shows when scrolling) */}
      {bubbles.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => navigate('/new')}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:scale-110 transition-transform duration-200 border border-white/20"
            aria-label="Create new thought"
          >
            <Plus className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const [bubbles, setBubbles] = useState<ThoughtBubble[]>([]);

  // Load bubbles from localStorage when the app starts
  useEffect(() => {
    const storedBubbles = getBubbles();
    setBubbles(storedBubbles);
  }, []);

  // Save bubbles to localStorage whenever they change
  useEffect(() => {
    saveBubbles(bubbles);
  }, [bubbles]);

  // Function to handle creating a new bubble
  const handleNewBubble = ({ content, mood }: Omit<ThoughtBubble, 'id' | 'timestamp'>) => {
    const newBubble: ThoughtBubble = {
      id: uuidv4(),
      content,
      mood,
      timestamp: Date.now(),
    };
  
    setBubbles(prev => [...prev, newBubble]);
  };

  // Function to handle saving changes to a bubble
  const handleSaveBubble = (id: string, content: string, mood: Mood) => {
    setBubbles(prev =>
      prev.map(bubble =>
        bubble.id === id ? { ...bubble, content, mood } : bubble
      )
    );
  };

  // Function to handle deleting a bubble
  const handleDeleteBubble = (id: string) => {
    setBubbles(prev => prev.filter(bubble => bubble.id !== id));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage 
              bubbles={bubbles} 
              onDelete={handleDeleteBubble} 
              onEdit={(id, newContent, mood) => {
                handleSaveBubble(id, newContent, mood);
              }}
            />
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
