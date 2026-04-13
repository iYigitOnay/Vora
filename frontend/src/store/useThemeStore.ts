import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PersonaTheme = 'EMBER_MOSS' | 'NEURAL_DARK' | 'FORGE_MODE' | 'AURA_LIGHT';

interface ThemeState {
  theme: PersonaTheme;
  setTheme: (theme: PersonaTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'EMBER_MOSS', // Artık varsayılan: Ember & Moss
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'vora-theme-storage',
    }
  )
);
