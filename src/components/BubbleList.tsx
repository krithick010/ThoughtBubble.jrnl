import React, { useEffect, useState, useRef } from 'react';
import { ThoughtBubble as ThoughtBubbleType } from '../types';
import ThoughtBubble from './ThoughtBubble';

interface BubbleListProps {
  bubbles: ThoughtBubbleType[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newContent: string) => void;
}

const BubbleList: React.FC<BubbleListProps> = ({ bubbles, onDelete, onEdit }) => {
  // State for bubble positions
  interface BubblePosition {
    x: number;
    y: number;
    size: number;
    rotation: number;
    depth: number; // Add depth for 3D layering
    floatOffset: number; // Adds variety to floating animation
  }

  const [positions, setPositions] = useState<BubblePosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse position for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1, // -1 to 1
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1  // -1 to 1
      });
    }
  };

  // Calculate non-colliding positions when bubbles change
  useEffect(() => {
    console.log("Calculating positions for", bubbles.length, "bubbles");
    
    // Function to check if two bubbles overlap
    const doOverlap = (pos1: BubblePosition, pos2: BubblePosition) => {
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
      const newPositions: BubblePosition[] = [];
      
      // For each bubble, find a non-colliding position
      for (let i = 0; i < bubbles.length; i++) {
        let validPosition = false;
        let pos: BubblePosition | null = null;
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
            size,
            rotation: Math.random() * 12 - 6, // -6 to 6 degrees rotation
            depth: Math.random() * 0.6 + 0.4, // 0.4 to 1.0 depth (1.0 = closest)
            floatOffset: Math.random() * 2 // Random offset for float animation
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
            size,
            rotation: Math.random() * 12 - 6,
            depth: Math.random() * 0.6 + 0.4,
            floatOffset: Math.random() * 2
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

  // If no bubbles, show message with sky blue background
  if (bubbles.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-white">
        <div className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 shadow-xl">
          <p className="text-xl mb-3">No thought bubbles yet.</p>
          <p className="text-sky-200">Create one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Subtle overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-blue-900/20 pointer-events-none"></div>
      
      {bubbles.map((bubble, index) => {
        // Skip if no position calculated
        if (!positions[index]) return null;
        
        const { x, y, size, rotation, depth, floatOffset } = positions[index];
        
        // Assign different animation class based on index
        const animationClass = index % 3 === 0 ? 'animate-float-1' : 
                              index % 3 === 1 ? 'animate-float-2' : 
                              'animate-float-3';
        
        // Calculate parallax offset based on mouse position and depth
        const parallaxX = mousePosition.x * (1 - depth) * 15;
        const parallaxY = mousePosition.y * (1 - depth) * 15;
                              
        return (
          <div 
            key={bubble.id}
            className={`absolute ${animationClass}`}
            style={{
              width: `${size}px`,
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) rotate(${rotation}deg)`,
              animationDelay: `${index * 0.5 % 5 + floatOffset}s`,
              zIndex: Math.round(depth * 100), // Higher depth = higher z-index (closer to viewer)
              filter: `drop-shadow(0 ${10 * depth}px ${20 * depth}px rgba(120, 80, 220, ${0.15 + depth * 0.3}))`,
            }}
          >
            {/* Create perspective wrapper */}
            <div 
              className="transform-gpu transition-all duration-300 ease-out"
              style={{ 
                transform: `perspective(1500px) rotateX(${5 * depth}deg) rotateY(${mousePosition.x * 10 * depth}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <ThoughtBubble 
                bubble={bubble} 
                onDelete={onDelete} 
                onEdit={onEdit}
                is3D={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BubbleList;