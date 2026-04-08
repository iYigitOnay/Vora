'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // LocalStorage'dan gelen temayı dökümana uygula
    document.documentElement.setAttribute('data-theme', theme);
    setMounted(true);
  }, [theme]);

  // SSR sırasında yanlış tema görünmesini engellemek için mounted kontrolü
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
