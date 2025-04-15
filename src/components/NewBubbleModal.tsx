import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Mood, ThoughtBubble } from '../types';

interface NewBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bubble: Omit<ThoughtBubble, 'id' | 'timestamp'>) => void;
}

const MOODS: Mood[] = ['Happy', 'Sad', 'Angry', 'Creative', 'Calm'];

// Mock AI suggestions based on mood and current content
const getAISuggestion = (mood: Mood, currentContent: string): string => {
  if (!currentContent || currentContent.trim().length < 3) return '';

  // Simple suggestion generation based on mood and last few words
  const lastWords = currentContent.split(' ').slice(-3).join(' ');
  
  const suggestions = {
    'Happy': [
      ' and it makes me feel so energized!',
      ' which brightens my day every time I think about it.',
      ' and I\'m looking forward to more experiences like this.',
    ],
    'Sad': [
      ' though I know things will get better soon.',
      ' but I\'m trying to focus on the positive aspects.',
      ` and I need to find healthy ways to process these emotions.`,
    ],
    'Angry': [
      ' and I need to take a moment to calm down and reflect.',
      ' but I should try to understand the other perspective.',
      ' though I know reacting impulsively won\'t help.',
    ],
    'Creative': [
      ' which could lead to an interesting project or collaboration.',
      ' and I wonder how I could expand on this idea further.',
      ' and combining this with my other interests could yield something unique.',
    ],
    'Calm': [
      ' and I feel at peace with my decisions.',
      ' which helps me maintain balance in my life.',
      ' and moments like these remind me to be present.',
    ]
  };

  // Select a random suggestion for the current mood
  const moodSuggestions = suggestions[mood] || suggestions['Happy'];
  const randomIndex = Math.floor(Math.random() * moodSuggestions.length);
  return moodSuggestions[randomIndex];
};

const NewBubbleModal: React.FC<NewBubbleModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>('Happy');
  const [content, setContent] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Clear suggestion when content changes significantly
    setSuggestion('');
    setShowSuggestion(false);
    
    // Don't generate suggestions for very short content
    if (content.length < 5) return;
    
    // Debounce suggestion generation
    const timer = setTimeout(() => {
      setIsGeneratingSuggestion(true);
      
      // In a real implementation, this would be an API call to an AI service
      setTimeout(() => {
        const aiSuggestion = getAISuggestion(selectedMood, content);
        setSuggestion(aiSuggestion);
        setShowSuggestion(!!aiSuggestion);
        setIsGeneratingSuggestion(false);
      }, 600); // Simulate API delay
    }, 1000); // Wait 1 second after typing stops
    
    return () => clearTimeout(timer);
  }, [content, selectedMood]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Accept suggestion with Shift+Enter
    if (e.key === 'Enter' && e.shiftKey && showSuggestion) {
      e.preventDefault();
      setContent(content + suggestion);
      setSuggestion('');
      setShowSuggestion(false);
    }
  };

  // Generate a different suggestion
  const handleRefreshSuggestion = () => {
    setIsGeneratingSuggestion(true);
    setTimeout(() => {
      const aiSuggestion = getAISuggestion(selectedMood, content);
      setSuggestion(aiSuggestion);
      setShowSuggestion(!!aiSuggestion);
      setIsGeneratingSuggestion(false);
    }, 400);
  };

  // Apply the suggestion to the content
  const handleApplySuggestion = () => {
    setContent(content + suggestion);
    setSuggestion('');
    setShowSuggestion(false);
    // Focus back on textarea after applying suggestion
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
              <span>What's on your mind?</span>
              {showSuggestion && (
                <span className="text-xs text-purple-600">Press Shift+Enter to accept suggestion</span>
              )}
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write your thoughts here..."
                required
              />
              
              {/* AI Suggestion display */}
              {showSuggestion && suggestion && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-700">AI Suggestion</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        onClick={handleRefreshSuggestion}
                        className="text-xs bg-white text-purple-600 border border-purple-300 px-2 py-1 rounded hover:bg-purple-50"
                        disabled={isGeneratingSuggestion}
                      >
                        Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={handleApplySuggestion}
                        className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  <div className="text-purple-800 italic">
                    {isGeneratingSuggestion ? 'Generating suggestion...' : <>{content}<span className="font-medium text-purple-900">{suggestion}</span></>}
                  </div>
                </div>
              )}
            </div>
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