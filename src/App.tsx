import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ThoughtBubble, Mood } from './types';
import { initialBubbles } from './data/initialBubbles';
import BubbleList from './components/BubbleList';
import NewBubblePage from './components/NewBubblePage';
import EditBubblePage from './components/EditBubblePage';

function App() {
  // Use localStorage to persist bubbles between page reloads
  const [bubbles, setBubbles] = useState<ThoughtBubble[]>(() => {
    const savedBubbles = localStorage.getItem('thoughtBubbles');
    return savedBubbles ? JSON.parse(savedBubbles) : initialBubbles;
  });

  // Save bubbles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('thoughtBubbles', JSON.stringify(bubbles));
  }, [bubbles]);

  const handleNewBubble = (bubbleData: Omit<ThoughtBubble, 'id' | 'timestamp'>) => {
    const newBubble: ThoughtBubble = {
      ...bubbleData,
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setBubbles([newBubble, ...bubbles]);
  };

  // Function to delete a bubble
  const handleDeleteBubble = (id: string) => {
    setBubbles(bubbles.filter(bubble => bubble.id !== id));
  };

  // Function to edit a bubble
  const handleEditBubble = (id: string, newContent: string) => {
    const updatedBubbles = bubbles.map(bubble => 
      bubble.id === id ? { ...bubble, content: newContent } : bubble
    );
    setBubbles(updatedBubbles);
  };
  
  // Function to edit a bubble with content and mood
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
              {/* Header */}
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
              
              <main className="w-full pt-16">
                <BubbleList 
                  bubbles={bubbles} 
                  onDelete={handleDeleteBubble} 
                  onEdit={handleEditBubble} 
                />
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