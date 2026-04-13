import { create } from 'zustand';

interface UserProfile {
  firstName: string;
  persona: string;
  goal: string;
}

interface DashboardData {
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  auraStreak: number;
}

interface AppState {
  user: UserProfile | null;
  dashboard: DashboardData | null;
  loading: boolean;
  setUser: (user: UserProfile) => void;
  setDashboard: (data: DashboardData) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  dashboard: null,
  loading: false,
  setUser: (user) => set({ user }),
  setDashboard: (dashboard) => set({ dashboard }),
  setLoading: (loading) => set({ loading }),
  clearAll: () => set({ user: null, dashboard: null }),
}));
