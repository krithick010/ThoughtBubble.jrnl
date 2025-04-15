import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ThoughtBubble } from './types';
import { initialBubbles } from './data/initialBubbles';
import BubbleList from './components/BubbleList';
import NewBubblePage from './components/NewBubblePage';

function App() {
  // Use localStorage to persist bubbles between page reloads
  const [bubbles, setBubbles] = useState<ThoughtBubble[]>(() => {
    const savedBubbles = localStorage.getItem('thoughtBubbles');
    return savedBubbles ? JSON.parse(savedBubbles) : initialBubbles;
  });

  // Save bubbles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('thoughtBubbles', JSON.stringify(bubbles));
    console.log("Saved bubbles to localStorage:", bubbles.length);
  }, [bubbles]);

  const handleNewBubble = (bubbleData: Omit<ThoughtBubble, 'id' | 'timestamp'>) => {
    const newBubble: ThoughtBubble = {
      ...bubbleData,
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    // Explicitly create a new array to ensure React detects the state change
    const updatedBubbles = [newBubble, ...bubbles];
    console.log("Adding new bubble. Total bubbles:", updatedBubbles.length);
    
    setBubbles(updatedBubbles);
  };

  // Debug - log current bubbles count
  console.log("Current bubbles in App:", bubbles.length);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
              {/* Fixed header with transparent background */}
              <header className="fixed w-full bg-white bg-opacity-90 shadow-sm z-10">
                <div className="w-full px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-purple-600">Thought Bubble AI</h1>
                    <span className="ml-3 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {bubbles.length} bubbles
                    </span>
                  </div>
                  <a
                    href="/new"
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    New Bubble
                  </a>
                </div>
              </header>
              
              {/* Full-width and full-height main content with padding-top to account for fixed header */}
              <main className="w-full pt-16">
                <BubbleList key={`bubbles-${bubbles.length}`} bubbles={bubbles} />
              </main>
            </div>
          }
        />
        <Route path="/new" element={<NewBubblePage onSubmit={handleNewBubble} />} />
      </Routes>
    </Router>
  );
}

export default App;