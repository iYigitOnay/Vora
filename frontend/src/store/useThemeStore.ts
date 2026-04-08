import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PersonaTheme = 'neural-dark' | 'forge-mode' | 'aura-light';

interface ThemeState {
  theme: PersonaTheme;
  setTheme: (theme: PersonaTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'neural-dark', // Varsayılan: Denge (Charcoal)
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
