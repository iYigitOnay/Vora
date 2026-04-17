import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PersonaTheme = 'EMBER_MOSS' | 'NEURAL_DARK' | 'FORGE_MODE' | 'AURA_LIGHT';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  textOnAccent: string;
  success: string;
  error: string;
  border: string;
}

const themes: Record<PersonaTheme, ThemeColors> = {
  EMBER_MOSS: {
    background: '#0D1117',
    surface: '#161B22',
    surfaceRaised: '#21262D',
    textPrimary: '#C9D1D9',
    textSecondary: '#8B949E',
    accent: '#D4A853',
    textOnAccent: '#0D1117',
    success: '#238636',
    error: '#DA3633',
    border: '#30363D',
  },
  NEURAL_DARK: {
    background: '#050505',
    surface: '#121212',
    surfaceRaised: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    accent: '#00C9A7',
    textOnAccent: '#000000',
    success: '#00D1FF',
    error: '#FF3D71',
    border: '#2A2A2A',
  },
  FORGE_MODE: {
    background: '#120B0A',
    surface: '#1D1412',
    surfaceRaised: '#2D1F1D',
    textPrimary: '#EBE3E0',
    textSecondary: '#A59490',
    accent: '#F59E0B',
    textOnAccent: '#120B0A',
    success: '#10B981',
    error: '#EF4444',
    border: '#3E2D2B',
  },
  AURA_LIGHT: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceRaised: '#F1F1F1',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    accent: '#5B21B6',
    textOnAccent: '#FFFFFF',
    success: '#059669',
    error: '#DC2626',
    border: '#E5E7EB',
  }
};

interface ThemeState {
  themeName: PersonaTheme;
  colors: ThemeColors;
  setTheme: (name: PersonaTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'EMBER_MOSS',
      colors: themes.EMBER_MOSS,
      setTheme: (name) => set({ themeName: name, colors: themes[name] }),
    }),
    {
      name: "vora-theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
