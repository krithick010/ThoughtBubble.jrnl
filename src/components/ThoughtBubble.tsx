import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThoughtBubble as ThoughtBubbleType, MOOD_COLORS } from '../types';
import { Trash2, Maximize2, Minimize2, Edit2, Check } from 'lucide-react';

interface ThoughtBubbleProps {
  bubble: ThoughtBubbleType;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
}

const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ 
  bubble, 
  onDelete = () => {}, 
  onEdit = () => {} 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(bubble.content);
  const navigate = useNavigate();

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
      className={`aspect-square rounded-full border-2 p-6 cursor-pointer transition-transform duration-300 
        overflow-hidden flex flex-col items-center justify-center backdrop-blur-sm
        ${MOOD_COLORS[bubble.mood]} 
        ${isExpanded ? 'scale-105 shadow-lg' : 'hover:scale-110'} 
        relative`}
      onClick={() => !isEditing && setShowControls(!showControls)}
    >
      {/* Content */}
      {isExpanded ? (
        <>
          <span className="text-lg font-medium mb-4">{bubble.mood}</span>
          
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onClick={handleTextAreaClick}
              className="w-full h-3/4 bg-white bg-opacity-70 rounded p-2 text-gray-700 resize-none"
              autoFocus
            />
          ) : (
            <p className="text-gray-700 overflow-y-auto">{bubble.content}</p>
          )}
          
          {!isEditing && (
            <p className="text-xs text-gray-500 mt-4 absolute bottom-4">
              {new Date(bubble.timestamp).toLocaleDateString()}
            </p>
          )}
        </>
      ) : (
        <span className="text-2xl font-bold text-gray-700">{bubble.mood}</span>
      )}

      {/* Edit Mode Save Button - shown when editing */}
      {isEditing && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleSave}
            className="bg-green-500 p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
            aria-label="Save"
          >
            <Check size={18} className="text-white" />
          </button>
        </div>
      )}

      {/* Controls overlay - only shown when bubble is clicked and not editing */}
      {showControls && !isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
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
                <Minimize2 size={18} className="text-gray-700" /> : 
                <Maximize2 size={18} className="text-gray-700" />
              }
            </button>
            
            {/* Edit button - Now navigates to edit page */}
            <button
              onClick={handleEdit}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-blue-100 transition-colors"
              aria-label="Edit"
            >
              <Edit2 size={18} className="text-blue-600" />
            </button>
            
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-red-100 transition-colors"
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