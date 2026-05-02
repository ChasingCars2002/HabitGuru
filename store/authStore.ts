import { create } from 'zustand';
import type { User } from 'firebase/auth';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AuthStore {
  user: User | null;
  isAuthLoading: boolean;   // true while Firebase resolves persisted session
  isFirebaseReady: boolean; // true once Firebase config is verified present
  syncStatus: SyncStatus;

  setUser: (user: User | null) => void;
  setAuthLoading: (v: boolean) => void;
  setFirebaseReady: (v: boolean) => void;
  setSyncStatus: (s: SyncStatus) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthLoading: true,
  isFirebaseReady: false,
  syncStatus: 'idle',

  setUser: (user) => set({ user, isAuthLoading: false }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setFirebaseReady: (isFirebaseReady) => set({ isFirebaseReady }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));
