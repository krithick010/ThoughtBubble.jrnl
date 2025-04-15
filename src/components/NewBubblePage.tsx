import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mood, ThoughtBubble } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles } from 'lucide-react';

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
  const [inlineSuggestion, setInlineSuggestion] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [showInlineHelp, setShowInlineHelp] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  
  // Show inline help message when a suggestion is available
  useEffect(() => {
    if (inlineSuggestion) {
      setShowInlineHelp(true);
      const timer = setTimeout(() => {
        setShowInlineHelp(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [inlineSuggestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mood: selectedMood,
      content,
    });
    setContent('');
    navigate('/');
  };

  // Generate inline suggestions as user types
  useEffect(() => {
    if (content.length < 15) {
      setInlineSuggestion('');
      return;
    }

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set new timeout to avoid generating suggestions on every keystroke
    const timeout = setTimeout(() => {
      generateInlineSuggestion();
    }, 1000);

    setTypingTimeout(timeout);

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [content, selectedMood]);

  // Function to generate inline suggestion using Gemini API
  const generateInlineSuggestion = async () => {
    // Don't generate if content is too short or ends with punctuation
    if (content.length < 15 || /[.!?]$/.test(content.trim())) {
      setInlineSuggestion('');
      return;
    }

    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
        console.warn('API key is missing. Using mock suggestions instead.');
        // Fall back to mock suggestions if API key is missing
        const mockSuggestions = {
          'Happy': [' and it fills me with so much joy!'],
          'Sad': [' although I\'m trying to stay positive.'],
          'Angry': [' and it\'s really frustrating to deal with.'],
          'Creative': [' and I see so many possibilities ahead.'],
          'Calm': [' and I feel at peace with everything.']
        };
        const suggestions = mockSuggestions[selectedMood] || mockSuggestions['Happy'];
        setInlineSuggestion(suggestions[0]);
        return;
      }

      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create a prompt for the AI - we want just a continuation, not a full response
      const prompt = `Complete this sentence fragment in a ${selectedMood.toLowerCase()} tone. 
      Be brief, conversational, and natural. Your completion should be 5-15 words maximum.
      Provide ONLY the completion - no quotes, no prefixes.Also the content output should be in 1st person format, give the content in first person format.
      
      Sentence fragment: "${content}"
      
      Completion:`;
      
      // Generate content with a short response and quick timeout
      const generationConfig = {
        maxOutputTokens: 30,
        temperature: 0.7,
      };

      // Add a timeout to avoid waiting too long for a suggestion
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Suggestion generation timed out')), 3000)
      );

      // Race the API call against the timeout
      const resultPromise = model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig
      });

      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      // Type guard to ensure we have the Gemini result
      if (result && typeof result === 'object' && 'response' in result) {
        const response = await result.response;
        if (typeof response === 'object' && response !== null && 'text' in response && typeof response.text === 'function') {
          const suggestion = response.text().trim();
          
          // Only use the suggestion if it's not too long and doesn't contain unwanted elements
          if (suggestion && suggestion.length > 0 && suggestion.length < 100 && !suggestion.includes('"') && !suggestion.includes('completion:')) {
            setInlineSuggestion(suggestion);
            // Show tooltip hint
            setShowInlineHelp(true);
          } else {
            setInlineSuggestion('');
          }
        } else {
          console.warn('Unexpected response format:', response);
          setInlineSuggestion('');
        }
      }
    } catch (error) {
      console.error('Error generating inline suggestion:', error);
      setInlineSuggestion('');
    }
  };

  // Accept inline suggestion on Tab or Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === 'Enter' && e.shiftKey) || e.key === 'Tab') {
      if (inlineSuggestion) {
        e.preventDefault();
        setContent(content + inlineSuggestion);
        setInlineSuggestion('');
        
        // Focus back on textarea and place cursor at the end
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = content.length + inlineSuggestion.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }
    }
  };

  // Track cursor position for better suggestion display
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleAiSuggestion = async () => {
    setIsLoading(true);
    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
        throw new Error('API key is missing. Please set VITE_GOOGLE_GENAI_API_KEY in your .env file.');
      }

      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Create a prompt for the AI
      const prompt = `Hey, I'm feeling ${selectedMood.toLowerCase()} today. Can you give me a few thoughts I might jot down in my journal about this mood? Nothing fancy - just casual, honest thoughts like someone would actually write in their personal journal. Keep it real and straightforward. Dont give in points format, just give it in paragraphs format, Make sure the grammer is correct.Follow up after ${content} and give the content in first person format.Dont print the content the user wrote`;
      
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
          <h1 className="text-2xl font-semibold text-gray-800">Create a New Bubble</h1>
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
            {/* Mood Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
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

            {/* Content Input - Custom textarea with inline suggestions */}
            <div className="flex-grow flex flex-col mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>What's on your mind?</span>
                {showInlineHelp && inlineSuggestion && (
                  <span className="text-xs text-purple-600 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" /> 
                    Press Tab or Shift+Enter to accept suggestion
                  </span>
                )}
              </label>
              
              <div className="relative flex-grow">
                {/* This is the main textarea where users type */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  className="w-full h-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg resize-none"
                  style={{ 
                    minHeight: "300px",
                    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  placeholder="Write your thoughts here..."
                  required
                />
                
                {/* This is the suggestion overlay */}
                {inlineSuggestion && (
                  <div 
                    className="pointer-events-none absolute top-0 left-0 w-full h-full px-4 py-3 text-lg"
                    style={{ 
                      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    <span className="invisible">{content}</span>
                    <span className="text-gray-400">{inlineSuggestion}</span>
                  </div>
                )}
                
                {/* Small sparkle icon to indicate AI when suggestion is active */}
                {inlineSuggestion && (
                  <div className="absolute top-3 right-3">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </div>
                )}
              </div>
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