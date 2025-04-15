import { ThoughtBubble } from '../types';

export const initialBubbles: ThoughtBubble[] = [
  {
    id: '1',
    mood: 'Happy',
    content: 'Had an amazing day at the park! The weather was perfect.',
    timestamp: Date.now() - 86400000,
  },
  {
    id: '2',
    mood: 'Creative',
    content: 'Working on a new project idea. The possibilities are endless!',
    timestamp: Date.now() - 43200000,
  },
  {
    id: '3',
    mood: 'Calm',
    content: 'Enjoying a peaceful evening with a good book and tea.',
    timestamp: Date.now() - 21600000,
  },
  {
    id: '4',
    mood: 'Sad',
    content: 'Missing my friends who moved away. Need to plan a virtual hangout soon.',
    timestamp: Date.now() - 10800000,
  },
];