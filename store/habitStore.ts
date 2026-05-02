import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import type { Habit, HabitStore } from '@/types';

function computeStreak(completions: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = format(date, 'yyyy-MM-dd');
    if (completions[key]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      isPremium: false,

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: uuidv4(),
          streak: 0,
          longestStreak: 0,
          createdAt: new Date().toISOString(),
          completions: {},
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
      },

      toggleCompletion: (id, date) => {
        set((state) => {
          const habits = state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const completions = { ...habit.completions };
            if (completions[date]) {
              delete completions[date];
            } else {
              completions[date] = true;
            }

            const streak = computeStreak(completions);
            const longestStreak = Math.max(streak, habit.longestStreak);

            return { ...habit, completions, streak, longestStreak };
          });
          return { habits };
        });
      },

      setIsPremium: (value) => set({ isPremium: value }),

      mergeHabits: (remoteHabits) => {
        set((state) => {
          const localMap = new Map(state.habits.map((h) => [h.id, h]));
          const merged: Habit[] = [...state.habits];

          for (const remote of remoteHabits) {
            const local = localMap.get(remote.id);
            if (!local) {
              merged.push(remote);
            } else {
              const idx = merged.findIndex((h) => h.id === remote.id);
              merged[idx] = {
                ...remote,
                ...local, // local editable props win
                completions: {
                  ...remote.completions,
                  ...local.completions, // local same-day data wins
                },
                streak: Math.max(local.streak, remote.streak),
                longestStreak: Math.max(local.longestStreak, remote.longestStreak),
              };
            }
          }

          return { habits: merged };
        });
      },
    }),
    {
      name: 'habit-guru-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
