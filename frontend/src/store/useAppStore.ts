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

interface InventoryItem {
  id: string;
  foodId: string;
  quantity: number;
  unit: string;
  minLimit?: number;
  food: {
    name: string;
    brand?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    image?: string;
  };
}

interface MealTemplate {
  id: string;
  name: string;
  items: {
    foodId: string;
    amount: number;
    food: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
}

interface AppState {
  user: UserProfile | null;
  dashboard: DashboardData | null;
  inventory: InventoryItem[];
  templates: MealTemplate[];
  loading: boolean;
  setUser: (user: UserProfile) => void;
  setDashboard: (data: DashboardData) => void;
  setInventory: (items: InventoryItem[]) => void;
  setTemplates: (templates: MealTemplate[]) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  dashboard: null,
  inventory: [],
  templates: [],
  loading: false,
  setUser: (user) => set({ user }),
  setDashboard: (dashboard) => set({ dashboard }),
  setInventory: (inventory) => set({ inventory }),
  setTemplates: (templates) => set({ templates }),
  setLoading: (loading) => set({ loading }),
  clearAll: () => set({ user: null, dashboard: null, inventory: [], templates: [] }),
}));
