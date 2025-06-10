import { create } from 'zustand';
import { User } from '@auth0/auth0-react';

interface AuthState {
  user: User | null;
  dbUser: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setDbUser: (dbUser: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  dbUser: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setDbUser: (dbUser) => set({ dbUser }),
  setLoading: (isLoading) => set({ isLoading }),
}));