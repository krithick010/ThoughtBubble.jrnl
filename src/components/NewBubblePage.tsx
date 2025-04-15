import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mood, ThoughtBubble } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MOODS: Mood[] = ['Happy', 'Sad', 'Angry', 'Creative', 'Calm'];

interface NewBubblePageProps {
  onSubmit: (bubble: Omit<ThoughtBubble, 'id' | 'timestamp'>) => void;
}

const NewBubblePage: React.FC<NewBubblePageProps> = ({ onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>('Happy');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mood: selectedMood,
      content,
    });
    setContent('');
    navigate('/');
  };

  const handleAiSuggestion = async () => {
    setIsLoading(true);
    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
        throw new Error('API key is missing. Please set VITE_GOOGLE_GENAI_API_KEY in your .env file.');
      }

      // Initialize the Gemini API client correctly
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Updated model name

      // Create a prompt for the AI
      const prompt = `Hey, I'm feeling ${selectedMood.toLowerCase()} today. Can you give me a few thoughts I might jot down in my journal about this mood? Nothing fancy - just casual, honest thoughts like someone would actually write in their personal journal. Keep it real and straightforward.`;
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestion = response.text();
      
      // Set AI suggestion in separate state
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
      alert('Failed to fetch AI suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to use AI suggestion in content
  const useAiSuggestion = () => {
    setContent((prevContent) => prevContent ? `${prevContent}\n\n${aiSuggestion}` : aiSuggestion);
    setAiSuggestion('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 z-10">
        <div className="flex justify-between items-center max-w-full mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800">Create a New Post</h1>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSubmit}
              form="post-form"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-600 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full height below header */}
      <div className="flex flex-grow overflow-hidden">
        {/* Editor Section - Left side */}
        <div className="w-3/4 overflow-auto p-6">
          <form id="post-form" onSubmit={handleSubmit} className="h-full flex flex-col">
            {/* Title and Mood Selection on the same line */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Title Input (takes up more space) */}
              <div className="flex-grow">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  placeholder="Enter title..."
                  required
                />
              </div>
              
              {/* Mood Selector (compact version) */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Feeling:</span>
                <select 
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value as Mood)}
                  className="border rounded-lg px-3 py-2 bg-white text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {MOODS.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Input - Grows to fill available space */}
            <div className="flex-grow flex flex-col mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-grow px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg resize-none"
                style={{ minHeight: "300px" }}
                placeholder="Write your thoughts here..."
                required
              />
            </div>
          </form>
        </div>
        
        {/* AI Suggestion Panel - Right side, full height */}
        <div className="w-1/4 bg-white shadow-md border-l border-gray-200 overflow-auto">
          <div className="p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Suggestions</h2>
            
            <div className="flex-grow overflow-auto mb-4">
              {!aiSuggestion && !isLoading && (
                <div className="text-gray-500 mb-4">
                  Get AI-powered writing suggestions based on your current mood.
                </div>
              )}
              
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              {aiSuggestion && (
                <div className="mb-4">
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{aiSuggestion}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={useAiSuggestion}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Use This Suggestion
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* AI Controls - Fixed at bottom */}
            <div className="mt-auto">
              <button
                onClick={handleAiSuggestion}
                disabled={isLoading}
                className="w-full bg-gray-100 text-gray-700 border border-gray-200 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {isLoading ? 'Generating...' : 'Generate AI Suggestion'}
              </button>
              
              <div className="mt-4 text-xs text-gray-500">
                AI suggestions are generated based on your selected mood. You can use them as inspiration for your writing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBubblePage;