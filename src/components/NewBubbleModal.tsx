import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Mood, ThoughtBubble } from '../types';

interface NewBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bubble: Omit<ThoughtBubble, 'id' | 'timestamp'>) => void;
}

const MOODS: Mood[] = ['Happy', 'Sad', 'Angry', 'Creative', 'Calm'];

const NewBubbleModal: React.FC<NewBubbleModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>('Happy');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mood: selectedMood,
      content,
    });
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Thought Bubble</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${
                      selectedMood === mood
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Write your thoughts here..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Bubble
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewBubbleModal;