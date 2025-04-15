export type Mood = 'Happy' | 'Sad' | 'Angry' | 'Creative' | 'Calm';

export interface ThoughtBubble {
  id: string;
  mood: Mood;
  content: string;
  timestamp: number;
}

export const MOOD_COLORS: Record<Mood, string> = {
  Happy: 'bg-yellow-100 border-yellow-300',
  Sad: 'bg-blue-100 border-blue-300',
  Angry: 'bg-red-100 border-red-300',
  Creative: 'bg-purple-100 border-purple-300',
  Calm: 'bg-green-100 border-green-300',
};