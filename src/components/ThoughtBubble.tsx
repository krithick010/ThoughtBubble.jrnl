import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThoughtBubble as ThoughtBubbleType, MOOD_COLORS, MOOD_COLOR_VALUES } from '../types';
import { Trash2, Maximize2, Minimize2, Edit2, Check } from 'lucide-react';

interface ThoughtBubbleProps {
  bubble: ThoughtBubbleType;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  is3D?: boolean;
}

const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ 
  bubble, 
  onDelete = () => {}, 
  onEdit = () => {},
  is3D = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(bubble.content);
  const navigate = useNavigate();

  // Get color classes and values based on mood
  const colorClass = MOOD_COLORS[bubble.mood];
  const colorValues = MOOD_COLOR_VALUES[bubble.mood];

  // Prevent click events from bubbling up when clicking buttons
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  // Handle delete with confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this bubble?')) {
      onDelete(bubble.id);
    }
  };

  // Navigate to edit page when edit button is clicked
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit/${bubble.id}`, { 
      state: { 
        bubble: bubble 
      }
    });
  };

  // Handle save after editing (for in-place editing fallback)
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(bubble.id, editedContent);
    setIsEditing(false);
  };

  // Prevent bubble click when interacting with textarea
  const handleTextAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`aspect-square rounded-full border-2 p-6 cursor-pointer
        overflow-hidden flex flex-col items-center justify-center backdrop-blur-sm
        ${colorClass} 
        ${isExpanded ? 'scale-105' : 'hover:scale-110'} 
        relative`}
      onClick={() => !isEditing && setShowControls(!showControls)}
      style={{
        boxShadow: is3D 
          ? `inset 0 10px 20px rgba(255, 255, 255, 0.4), 
             0 10px 30px ${colorValues.shadow},
             0 2px 10px rgba(255, 255, 255, 0.3)` 
          : undefined,
        background: is3D 
          ? `radial-gradient(circle at 30% 30%, ${colorValues.light}, ${colorValues.mid})` 
          : undefined,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: is3D ? `2px solid ${colorValues.mid}` : undefined
      }}
    >
      {/* Create glass reflection effect for 3D */}
      {is3D && (
        <div 
          className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%, ${colorValues.dark}22 90%)`,
            borderBottom: `1px solid ${colorValues.dark}22`
          }}
        />
      )}

      {/* Mood indicator icon or element */}
      <div 
      >
        {bubble.mood === 'Happy' && <span className="text-sm"></span>}
        {bubble.mood === 'Sad' && <span className="text-sm"></span>}
        {bubble.mood === 'Angry' && <span className="text-sm"></span>}
        {bubble.mood === 'Creative' && <span className="text-sm"></span>}
        {bubble.mood === 'Calm' && <span className="text-sm"></span>}
      </div>

      {/* Content */}
      {isExpanded ? (
        <>
          <span 
            className="text-lg font-medium mb-4"
            style={{ color: colorValues.dark }}
          >
            {bubble.mood}
          </span>
          
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onClick={handleTextAreaClick}
              className="w-full h-3/4 bg-white bg-opacity-70 rounded p-2 resize-none"
              style={{ color: colorValues.text }}
              autoFocus
            />
          ) : (
            <p 
              className="overflow-y-auto px-2" 
              style={{ color: colorValues.text }}
            >
              {bubble.content}
            </p>
          )}
          
          {!isEditing && (
            <p className="text-xs mt-4 absolute bottom-4 opacity-70" style={{ color: colorValues.dark }}>
              {new Date(bubble.timestamp).toLocaleDateString()}
            </p>
          )}
        </>
      ) : (
        <span 
          className="text-2xl font-bold"
          style={{ color: colorValues.dark }}
        >
          {bubble.mood}
        </span>
      )}

      {/* Edit Mode Save Button - shown when editing */}
      {isEditing && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleSave}
            className="p-2 rounded-full shadow-lg transition-colors"
            style={{ 
              backgroundColor: colorValues.accent,
              color: 'white' 
            }}
            aria-label="Save"
          >
            <Check size={18} />
          </button>
        </div>
      )}

      {/* Controls overlay - only shown when bubble is clicked and not editing */}
      {showControls && !isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-[2px]">
          <div className="flex gap-3">
            {/* Expand/Collapse button */}
            <button
              onClick={(e) => handleButtonClick(e, () => {
                setIsExpanded(!isExpanded);
                setShowControls(false);
              })}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? 
                <Minimize2 size={18} style={{ color: colorValues.dark }} /> : 
                <Maximize2 size={18} style={{ color: colorValues.dark }} />
              }
            </button>
            
            {/* Edit button - Now navigates to edit page */}
            <button
              onClick={handleEdit}
              className="bg-white p-2 rounded-full shadow-lg transition-colors hover:bg-opacity-50"
              style={{ color: colorValues.accent }}
              aria-label="Edit"
            >
              <Edit2 size={18} />
            </button>
            
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtBubble;