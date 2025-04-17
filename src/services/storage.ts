import { ThoughtBubble } from "../types";

// Key for storing bubbles in localStorage
const STORAGE_KEY = 'thought-bubbles';

// Get all bubbles from storage
export const getBubbles = (): ThoughtBubble[] => {
  try {
    const storedBubbles = localStorage.getItem(STORAGE_KEY);
    return storedBubbles ? JSON.parse(storedBubbles) : [];
  } catch (error) {
    console.error('Error retrieving bubbles from localStorage:', error);
    return [];
  }
};

// Save all bubbles to storage
export const saveBubbles = (bubbles: ThoughtBubble[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bubbles));
  } catch (error) {
    console.error('Error saving bubbles to localStorage:', error);
  }
};

// Add a new bubble
export const addBubble = (bubble: ThoughtBubble): void => {
  const bubbles = getBubbles();
  saveBubbles([...bubbles, bubble]);
};

// Update an existing bubble
export const updateBubble = (id: string, updates: Partial<ThoughtBubble>): void => {
  const bubbles = getBubbles();
  const updatedBubbles = bubbles.map(bubble => 
    bubble.id === id ? { ...bubble, ...updates } : bubble
  );
  saveBubbles(updatedBubbles);
};

// Delete a bubble
export const deleteBubble = (id: string): void => {
  const bubbles = getBubbles();
  const filteredBubbles = bubbles.filter(bubble => bubble.id !== id);
  saveBubbles(filteredBubbles);
};