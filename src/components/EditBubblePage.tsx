import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ThoughtBubble, Mood, MOOD_COLORS } from '../types';
import { SendHorizontal, ArrowLeft, Save, Sparkles, User, Bot } from 'lucide-react';

interface EditBubblePageProps {
  onSave: (id: string, content: string, mood: Mood) => void;
  onDelete: (id: string) => void;
  bubbles: ThoughtBubble[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const EditBubblePage: React.FC<EditBubblePageProps> = ({ onSave, onDelete, bubbles }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Get bubble data either from location state or find it in bubbles array
  const bubbleFromState = location.state?.bubble as ThoughtBubble | undefined;
  const bubbleFromProps = bubbles.find(b => b.id === id);
  const bubble = bubbleFromState || bubbleFromProps;
  
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('Happy');
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [hasInitialAiResponse, setHasInitialAiResponse] = useState(false);
  
  // Load bubble data when component mounts
  useEffect(() => {
    if (bubble) {
      setContent(bubble.content);
      setMood(bubble.mood);
      
      // Add first message as user's thought
      setChatMessages([
        {
          role: 'user',
          content: bubble.content,
          timestamp: Date.now()
        }
      ]);
      
      // Get initial AI response
      if (!hasInitialAiResponse) {
        getAiResponse(bubble.content, bubble.mood);
        setHasInitialAiResponse(true);
      }
    } else {
      // If bubble not found, navigate back to home
      navigate('/');
    }
  }, [bubble, navigate]);
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Function to get AI response - updated with better error handling and simplified API usage
  const getAiResponse = async (userMessage: string, currentMood: Mood) => {
    setIsAiTyping(true);
    
    try {
      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      
      if (!apiKey) {
        // Use mock responses if API key is missing
        setTimeout(() => {
          const mockResponses = {
            'Happy': "I'm glad you're feeling positive! What aspects of this experience bring you the most joy?",
            'Sad': "I understand this is difficult. Would you like to talk more about what's troubling you?",
            'Angry': "I can see you're frustrated. Taking a moment to breathe can help. Would you like to explore what triggered these feelings?",
            'Creative': "That's a fascinating perspective! What inspired this creative thought?",
            'Calm': "It sounds like you're in a good headspace. How did you achieve this sense of peace?"
          };
          
          const response = mockResponses[currentMood] || "Thank you for sharing your thoughts. How are you feeling about this right now?";
          
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: response,
            timestamp: Date.now()
          }]);
          
          setIsAiTyping(false);
        }, 1500);
        
        return;
      }
      
      // Initialize the Gemini API client with simplified approach
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Create a simple prompt without using chat history to avoid format issues
      const prompt = `
      You are ThoughtBubble AI, a compassionate and thoughtful AI companion.

      The user has shared a thought with you. They're feeling ${currentMood.toLowerCase()}.

      Context from previous messages (for reference only - don't repeat this back to the user):
      ${chatMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

      Current message from user: "${userMessage}"

      Respond with empathy and understanding. Ask thoughtful follow-up questions to help them explore their feelings.
      Be conversational and warm. Don't be clinical or overly formal.
      Act like a supportive therapist - focus on listening and validation rather than solving their problems.

      Important instructions:
      1. After providing support for a while, if the conversation seems to be wrapping up naturally, gently suggest they can type "I am fine" to close this reflection bubble if they're feeling better.
      2. Only suggest this when it seems appropriate, not in every message.
      3. Don't mention that typing "I am fine" will delete anything - just present it as a way to conclude the session.
      4. Don't mention that you're an AI or apologize for being one.
      5. Keep your responses concise (2-4 sentences).
      `;
      
      // Generate content with simple parameters
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      }]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // More detailed logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Use mock responses as fallback on error
      const fallbackResponses = [
        "That's interesting. How long have you been feeling this way?",
        "I understand. What do you think triggered these thoughts?",
        "Thank you for sharing that with me. How does expressing this make you feel?",
        "I'm curious to hear more about your experience. Would you like to elaborate?",
        "That sounds meaningful to you. What aspects of this are most important?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: randomResponse,
        timestamp: Date.now()
      }]);
      
    } finally {
      setIsAiTyping(false);
    }
  };

  // Updated handleSendMessage function with confirmation
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Special case for "I am fine" message
    if (userInput.trim().toLowerCase() === "i am fine") {
      // First add the user message to chat
      setChatMessages(prev => [
        ...prev, 
        {
          role: 'user',
          content: userInput,
          timestamp: Date.now()
        }
      ]);
      
      // Clear input field
      setUserInput('');
      
      // Confirm deletion
      const shouldDelete = window.confirm("Are you sure you want to delete this thought bubble? This action cannot be undone.");
      
      if (shouldDelete) {
        // Add final AI message
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm glad you're feeling better! Taking the time to reflect can be really helpful. I'll close this bubble now.",
            timestamp: Date.now() + 1
          }
        ]);
        
        // Set a small delay so the user can see the final message
        setTimeout(() => {
          // Delete the bubble
          if (id) {
            onDelete(id);
          }
          // Navigate back to home page
          navigate('/');
        }, 2500);
      } else {
        // If user cancels, add a response acknowledging continuation
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "I understand. Let's continue our conversation. Is there anything else on your mind?",
            timestamp: Date.now() + 1
          }
        ]);
      }
      
      return;
    }
    
    // Normal message flow (existing code)
    // Add user message to chat
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    }]);
    
    // Update the actual bubble content to include all user messages
    const updatedContent = content + '\n\n' + userInput;
    setContent(updatedContent);
    
    // Get AI response
    getAiResponse(userInput, mood);
    
    // Clear input
    setUserInput('');
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle saving changes
  const handleSave = () => {
    if (id) {
      onSave(id, content, mood);
      navigate('/');
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 z-10">
        <div className="flex justify-between items-center max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Reflective Chat</h1>
              <p className="text-sm text-gray-500">AI-powered conversation about your thoughts</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-grow flex flex-col p-4 max-w-3xl mx-auto w-full">
        {/* Mood indicator */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              mood === 'Happy' ? 'bg-yellow-400' :
              mood === 'Sad' ? 'bg-blue-400' :
              mood === 'Angry' ? 'bg-red-500' :
              mood === 'Creative' ? 'bg-purple-500' :
              'bg-green-500'
            }`}></div>
            <span className="text-sm font-medium">Mood: {mood}</span>
          </div>
          <div className="text-sm text-gray-500">
            Conversation with ThoughtBubble AI
          </div>
        </div>
        
        {/* Chat messages */}
        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          style={{ maxHeight: 'calc(100vh - 240px)' }}
        >
          {chatMessages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' 
                    ? <User size={14} className="text-purple-200" /> 
                    : <Bot size={14} className="text-purple-500" />
                  }
                  <span className="text-xs opacity-75">
                    {message.role === 'user' ? 'You' : 'ThoughtBubble AI'} • {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isAiTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-purple-500" />
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Add this right above the input area */}
        <div className="mb-2 text-xs text-center text-gray-500 flex items-center justify-center">
          <span>Type "I am fine" when you're ready to close this reflection</span>
        </div>

        {/* Input area */}
        <div className="relative">
          <textarea 
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your thoughts..."
            className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isAiTyping}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isAiTyping}
            className={`absolute right-3 bottom-3 p-2 rounded-full
              ${userInput.trim() && !isAiTyping 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-center text-gray-500 flex items-center justify-center">
          <Sparkles size={12} className="mr-1 text-purple-400" />
          Powered by Gemini AI • Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default EditBubblePage;