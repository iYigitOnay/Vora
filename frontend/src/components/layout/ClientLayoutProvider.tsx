"use client";

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/layout/Sidebar";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { useThemeStore } from '@/store/useThemeStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ClientLayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  const { setDashboard, setUser } = useAppStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const initSync = async () => {
      const token = localStorage.getItem('vora_access_token');
      if (token && !isAuthPage) {
        try {
          const res = await api.get('/dashboard/summary');
          setDashboard(res.data);
          setUser(res.data.user);
          // Backend'deki personayı temaya yansıt
          if (res.data.user.persona) {
            setTheme(res.data.user.persona);
          }
        } catch (err) {
          console.error("Initial sync error:", err);
        }
      }
    };
    initSync();
  }, [isAuthPage, setDashboard, setUser, setTheme]);

  return (
    <>
      {!isAuthPage && <Sidebar />}
      <main className={cn(
        "flex-1 min-h-screen transition-colors duration-1000",
        !isAuthPage ? "pl-0 md:pl-[280px]" : "pl-0"
      )}>
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
