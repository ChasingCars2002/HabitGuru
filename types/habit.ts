export type HabitFrequency = 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
export type TimeOfDay = 'anytime' | 'morning' | 'afternoon' | 'evening';
export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'social'
  | 'finance'
  | 'creativity'
  | 'other';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sun…6=Sat for 'custom' frequency
  timeOfDay: TimeOfDay;
  streak: number;
  longestStreak: number;
  createdAt: string; // ISO date
  completions: Record<string, boolean>; // { 'YYYY-MM-DD': true }
}

export interface HabitStore {
  habits: Habit[];
  isPremium: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'longestStreak' | 'createdAt' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: string) => void;
  setIsPremium: (value: boolean) => void;
}
