export type Mood = 'Happy' | 'Sad' | 'Angry' | 'Creative' | 'Calm';

export interface ThoughtBubble {
  id: string;
  mood: Mood;
  content: string;
  timestamp: number;
}

// Enhanced mood colors with more distinct and emotionally appropriate colors
export const MOOD_COLORS: Record<Mood, string> = {
  Happy: 'bg-amber-100 border-amber-300 text-amber-800',
  Sad: 'bg-blue-100 border-blue-400 text-blue-800',
  Angry: 'bg-red-100 border-red-400 text-red-800',
  Creative: 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-800',
  Calm: 'bg-emerald-100 border-emerald-300 text-emerald-800',
};

// Color variables for 3D effects and gradients
export const MOOD_COLOR_VALUES: Record<Mood, {
  light: string,
  mid: string,
  dark: string,
  accent: string,
  text: string,
  shadow: string
}> = {
  Happy: {
    light: '#fef3c7', // amber-100
    mid: '#fcd34d',   // amber-300
    dark: '#b45309',  // amber-700
    accent: '#f59e0b', // amber-500
    text: '#92400e',  // amber-800
    shadow: 'rgba(251, 191, 36, 0.4)' // amber-400 with opacity
  },
  Sad: {
    light: '#dbeafe', // blue-100
    mid: '#93c5fd',   // blue-300
    dark: '#1d4ed8',  // blue-700
    accent: '#3b82f6', // blue-500
    text: '#1e40af',  // blue-800
    shadow: 'rgba(59, 130, 246, 0.4)' // blue-500 with opacity
  },
  Angry: {
    light: '#fee2e2', // red-100
    mid: '#fca5a5',   // red-300
    dark: '#b91c1c',  // red-700
    accent: '#ef4444', // red-500
    text: '#991b1b',  // red-800
    shadow: 'rgba(239, 68, 68, 0.4)' // red-500 with opacity
  },
  Creative: {
    light: '#fae8ff', // fuchsia-100
    mid: '#f0abfc',   // fuchsia-300
    dark: '#a21caf',  // fuchsia-700
    accent: '#d946ef', // fuchsia-500
    text: '#86198f',  // fuchsia-800
    shadow: 'rgba(217, 70, 239, 0.4)' // fuchsia-500 with opacity
  },
  Calm: {
    light: '#d1fae5', // emerald-100
    mid: '#6ee7b7',   // emerald-300
    dark: '#047857',  // emerald-700
    accent: '#10b981', // emerald-500
    text: '#065f46',  // emerald-800
    shadow: 'rgba(16, 185, 129, 0.4)' // emerald-500 with opacity
  }
};