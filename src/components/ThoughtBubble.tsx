import React, { useState } from 'react';
import { ThoughtBubble as ThoughtBubbleType, MOOD_COLORS } from '../types';

interface ThoughtBubbleProps {
  bubble: ThoughtBubbleType;
}

const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ bubble }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`aspect-square rounded-full border-2 p-6 cursor-pointer transition-transform duration-300 
        overflow-hidden flex flex-col items-center justify-center backdrop-blur-sm
        ${MOOD_COLORS[bubble.mood]} 
        ${isExpanded ? 'scale-105 shadow-lg' : 'hover:scale-110'} 
        relative`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? (
        <>
          <span className="text-lg font-medium mb-4">{bubble.mood}</span>
          <p className="text-gray-700 overflow-y-auto">{bubble.content}</p>
          <p className="text-xs text-gray-500 mt-4 absolute bottom-4">
            {new Date(bubble.timestamp).toLocaleDateString()}
          </p>
        </>
      ) : (
        <span className="text-2xl font-bold text-gray-700">{bubble.mood}</span>
      )}
    </div>
  );
};

export default ThoughtBubble;