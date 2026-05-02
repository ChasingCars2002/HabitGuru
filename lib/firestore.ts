import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Habit } from '@/types';

// ─── Collection helpers ────────────────────────────────────────────────────

function habitsCol(uid: string) {
  return collection(db, 'users', uid, 'habits');
}

function habitDoc(uid: string, habitId: string) {
  return doc(db, 'users', uid, 'habits', habitId);
}

function profileDoc(uid: string) {
  return doc(db, 'users', uid, 'profile', 'data');
}

// ─── Types ────────────────────────────────────────────────────────────────

type FirestoreHabit = Omit<Habit, 'createdAt'> & {
  createdAt: string;
  updatedAt: string;
};

// ─── Write ────────────────────────────────────────────────────────────────

export async function uploadHabits(uid: string, habits: Habit[]): Promise<void> {
  if (habits.length === 0) return;

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const habit of habits) {
    const ref = habitDoc(uid, habit.id);
    const payload: FirestoreHabit = { ...habit, updatedAt: now };
    batch.set(ref, payload, { merge: true });
  }

  await batch.commit();
}

export async function uploadSingleHabit(uid: string, habit: Habit): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(habitDoc(uid, habit.id), { ...habit, updatedAt: now }, { merge: true });
}

export async function deleteRemoteHabit(uid: string, habitId: string): Promise<void> {
  await deleteDoc(habitDoc(uid, habitId));
}

export async function updateProfile(uid: string, isPremium: boolean): Promise<void> {
  await setDoc(
    profileDoc(uid),
    { isPremium, lastSync: new Date().toISOString() },
    { merge: true }
  );
}

// ─── Read ─────────────────────────────────────────────────────────────────

export async function fetchHabits(uid: string): Promise<Habit[]> {
  const snap = await getDocs(habitsCol(uid));
  return snap.docs.map((d) => {
    const data = d.data() as FirestoreHabit;
    // Strip server-only field before returning to local store
    const { updatedAt, ...habit } = data;
    return habit as Habit;
  });
}

export async function fetchProfile(
  uid: string
): Promise<{ isPremium: boolean } | null> {
  const snap = await getDoc(profileDoc(uid));
  if (!snap.exists()) return null;
  return snap.data() as { isPremium: boolean };
}

// ─── Merge helper ─────────────────────────────────────────────────────────

/**
 * Merges remote habits into local habits.
 * - Remote-only habits are added.
 * - For shared habits: completions are unioned, streaks take the max.
 * Returns the merged array (does NOT mutate inputs).
 */
export function mergeHabitLists(local: Habit[], remote: Habit[]): Habit[] {
  const localMap = new Map(local.map((h) => [h.id, h]));
  const result: Habit[] = [...local];

  for (const remoteHabit of remote) {
    const localHabit = localMap.get(remoteHabit.id);
    if (!localHabit) {
      // Only on remote → add to local
      result.push(remoteHabit);
    } else {
      // Exists in both → union completions, take best stats
      const mergedIdx = result.findIndex((h) => h.id === remoteHabit.id);
      result[mergedIdx] = {
        ...remoteHabit,
        ...localHabit, // local fields win for editable props
        completions: {
          ...remoteHabit.completions,
          ...localHabit.completions, // local wins for same-day data
        },
        streak: Math.max(localHabit.streak, remoteHabit.streak),
        longestStreak: Math.max(
          localHabit.longestStreak,
          remoteHabit.longestStreak
        ),
      };
    }
  }

  return result;
}
