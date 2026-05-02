import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  fetchHabits,
  fetchProfile,
  uploadHabits,
  uploadSingleHabit,
  deleteRemoteHabit,
  updateProfile,
} from '@/lib/firestore';
import { signInAnon } from '@/lib/auth';
import { useHabitStore } from '@/store/habitStore';
import { useAuthStore } from '@/store/authStore';

const DEBOUNCE_MS = 2000; // 2s debounce to batch rapid toggles

/**
 * Initializes Firebase Auth (anonymous sign-in on first launch),
 * listens for auth state, and keeps Firestore in sync with the local store.
 *
 * Call this once in the root layout.
 */
export function useFirebaseSync() {
  const { setUser, setAuthLoading, setFirebaseReady, setSyncStatus } =
    useAuthStore();
  const { habits, mergeHabits, setIsPremium } = useHabitStore();

  const prevHabitsRef = useRef<typeof habits>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  // ── Check Firebase is configured ────────────────────────────────────────
  useEffect(() => {
    const configured = Boolean(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
    setFirebaseReady(configured);
    if (!configured) {
      setAuthLoading(false); // Skip auth entirely — offline mode
    }
  }, []);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted.current) return;

      if (user) {
        setUser(user);
        await pullFromFirestore(user.uid);
      } else {
        // No session — sign in anonymously (silent, no UI)
        try {
          await signInAnon();
          // onAuthStateChanged will fire again with the new anon user
        } catch {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  // ── Pull: Firestore → local ──────────────────────────────────────────────
  async function pullFromFirestore(uid: string) {
    setSyncStatus('syncing');
    try {
      const [remoteHabits, profile] = await Promise.all([
        fetchHabits(uid),
        fetchProfile(uid),
      ]);

      if (!isMounted.current) return;

      if (remoteHabits.length > 0) {
        mergeHabits(remoteHabits);
      }
      if (profile?.isPremium) {
        setIsPremium(true);
      }

      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }

  // ── Push: local → Firestore (debounced) ─────────────────────────────────
  const pushToFirestore = useCallback(
    (uid: string, currentHabits: typeof habits) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        if (!isMounted.current) return;
        setSyncStatus('syncing');
        try {
          await uploadHabits(uid, currentHabits);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  // ── Watch for local habit changes and push ───────────────────────────────
  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user || !process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) return;

    // Skip on initial mount — pull already handled by auth listener
    if (prevHabitsRef.current.length === 0 && habits.length === 0) {
      prevHabitsRef.current = habits;
      return;
    }

    if (habits !== prevHabitsRef.current) {
      prevHabitsRef.current = habits;
      pushToFirestore(user.uid, habits);
    }
  }, [habits]);

  // ── Expose helpers for manual use (sign-out cleanup, etc.) ──────────────
  return { pullFromFirestore };
}
