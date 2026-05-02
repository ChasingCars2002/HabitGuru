import { format, getDay } from 'date-fns';
import { useHabitStore } from '@/store';
import type { Habit } from '@/types';

function isScheduledToday(habit: Habit, today: Date): boolean {
  const day = getDay(today); // 0=Sun…6=Sat

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return day >= 1 && day <= 5;
    case 'weekends':
      return day === 0 || day === 6;
    case 'weekly':
      return day === 1; // defaults to Monday
    case 'custom':
      return habit.customDays?.includes(day) ?? false;
    default:
      return true;
  }
}

export function useHabitsForToday() {
  const habits = useHabitStore((s) => s.habits);
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');

  const todayHabits = habits.filter((h) => isScheduledToday(h, today));
  const completed = todayHabits.filter((h) => h.completions[todayKey]);
  const pending = todayHabits.filter((h) => !h.completions[todayKey]);

  const completionRate =
    todayHabits.length > 0 ? completed.length / todayHabits.length : 0;

  return { todayHabits, completed, pending, completionRate, todayKey };
}
