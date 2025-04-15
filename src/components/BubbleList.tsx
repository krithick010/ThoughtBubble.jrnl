import React, { useEffect, useState } from 'react';
import { ThoughtBubble as ThoughtBubbleType } from '../types';
import ThoughtBubble from './ThoughtBubble';

interface BubbleListProps {
  bubbles: ThoughtBubbleType[];
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

const BubbleList: React.FC<BubbleListProps> = ({ bubbles, onDelete, onEdit }) => {
  // State for bubble positions
  const [positions, setPositions] = useState<Array<{x: number, y: number, size: number}>>([]);
  
  // Calculate non-colliding positions when bubbles change
  useEffect(() => {
    console.log("Calculating positions for", bubbles.length, "bubbles");
    
    // Function to check if two bubbles overlap
    const doOverlap = (pos1: {x: number, y: number, size: number}, pos2: {x: number, y: number, size: number}) => {
      // Calculate minimum distance needed between centers to prevent overlap
      const minDistance = (pos1.size + pos2.size) / window.innerWidth * 50 + 5;
      
      // Calculate actual distance between centers
      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < minDistance;
    };
    
    // Generate positions without collisions
    const generatePositions = () => {
      const newPositions: Array<{x: number, y: number, size: number}> = [];
      
      // For each bubble, find a non-colliding position
      for (let i = 0; i < bubbles.length; i++) {
        let validPosition = false;
        let pos = null;
        let attempts = 0;
        
        // Grid-based sizing for variety but consistency
        const size = 180 + (i % 3) * 30; // 180, 210, or 240px
        
        // Try to find a non-colliding position
        while (!validPosition && attempts < 30) {
          attempts++;
          
          // Generate a candidate position
          pos = {
            x: Math.random() * 80 + 5, // 5-85%
            y: Math.random() * 75 + 15, // 15-90%
            size
          };
          
          // Check against all existing positions
          validPosition = true;
          for (let j = 0; j < newPositions.length; j++) {
            if (doOverlap(pos, newPositions[j])) {
              validPosition = false;
              break;
            }
          }
        }
        
        // If no valid position found after attempts, use a backup position
        if (!validPosition) {
          // Place in a grid pattern as fallback
          pos = {
            x: 10 + (i * 25) % 70,
            y: 20 + (Math.floor(i / 3) * 30),
            size
          };
        }
        
        if (pos) {
          newPositions.push(pos);
        }
      }
      
      return newPositions;
    };
    
    // Set new positions whenever bubbles change
    setPositions(generatePositions());
    
  }, [bubbles.length]);

  // If no bubbles, show message
  if (bubbles.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-gray-500">
        No thought bubbles yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {bubbles.map((bubble, index) => {
        // Skip if no position calculated
        if (!positions[index]) return null;
        
        const { x, y, size } = positions[index];
        
        // Assign different animation class based on index
        const animationClass = index % 3 === 0 ? 'animate-float-1' : 
                              index % 3 === 1 ? 'animate-float-2' : 
                              'animate-float-3';
        
        return (
          <div 
            key={bubble.id}
            className={`absolute ${animationClass}`}
            style={{
              width: `${size}px`,
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${index * 0.5 % 5}s`,
              zIndex: 1
            }}
          >
            <ThoughtBubble 
              bubble={bubble} 
              onDelete={onDelete} 
              onEdit={onEdit}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BubbleList;