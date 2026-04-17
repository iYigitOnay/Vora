import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  email: string;
  firstName?: string;
  persona?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        console.log("Auth Store GÃ¼ncelleniyor: ", user.email);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        console.log("Auth Store SÄ±fÄ±rlanÄ±yor (Logout)");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "vora-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
