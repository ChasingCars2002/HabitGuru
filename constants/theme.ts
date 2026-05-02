export const Colors = {
  dark: {
    background: '#0F0F0F',
    card: '#1A1A1A',
    elevated: '#252525',
    border: '#2E2E2E',
    textPrimary: '#F5F5F5',
    textSecondary: '#9A9A9A',
    textMuted: '#5A5A5A',
    primary: '#7C6FCD',
    primaryLight: '#A89EE0',
    primaryDark: '#5A4FB5',
    accent: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFE66D',
    tabBar: '#141414',
    tabBarBorder: '#2A2A2A',
  },
  light: {
    background: '#F8F8F8',
    card: '#FFFFFF',
    elevated: '#EFEFEF',
    border: '#E0E0E0',
    textPrimary: '#0F0F0F',
    textSecondary: '#6B6B6B',
    textMuted: '#AAAAAA',
    primary: '#7C6FCD',
    primaryLight: '#A89EE0',
    primaryDark: '#5A4FB5',
    accent: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFE66D',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E0E0E0',
  },
} as const;

export const HabitColors: string[] = [
  '#7C6FCD', // violet
  '#FF6B6B', // coral
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#A8E6CF', // mint
  '#FF8B94', // pink
  '#B8B0FF', // lavender
  '#FFA07A', // light salmon
  '#87CEEB', // sky blue
  '#DDA0DD', // plum
  '#98FB98', // pale green
  '#F0E68C', // khaki
];

export const HabitIcons: Array<{ icon: string; label: string }> = [
  { icon: '💧', label: 'Water' },
  { icon: '🏃', label: 'Run' },
  { icon: '🧘', label: 'Meditate' },
  { icon: '📚', label: 'Read' },
  { icon: '✍️', label: 'Journal' },
  { icon: '🎯', label: 'Focus' },
  { icon: '🥗', label: 'Eat Well' },
  { icon: '😴', label: 'Sleep' },
  { icon: '💪', label: 'Workout' },
  { icon: '🧠', label: 'Learn' },
  { icon: '🎨', label: 'Create' },
  { icon: '🌿', label: 'Nature' },
  { icon: '🎵', label: 'Music' },
  { icon: '💊', label: 'Vitamins' },
  { icon: '🚶', label: 'Walk' },
  { icon: '🙏', label: 'Gratitude' },
  { icon: '💰', label: 'Save' },
  { icon: '📱', label: 'Digital' },
  { icon: '☕', label: 'Coffee' },
  { icon: '🌅', label: 'Morning' },
];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const FREE_HABIT_LIMIT = 3;
