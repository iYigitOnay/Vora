'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  BarChart3, 
  User,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Merkez', href: '/', icon: Home },
  { name: 'Günlük', href: '/diary', icon: Calendar },
  { name: 'Analiz', href: '/analysis', icon: BarChart3 },
  { name: 'Profil', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <nav className="bg-vora-surface/40 backdrop-blur-2xl border border-white/5 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-between items-center relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center gap-1 group transition-all"
            >
              <item.icon 
                className={cn(
                  "w-5 h-5 transition-all duration-500",
                  isActive ? "text-vora-accent scale-110" : "text-vora-tertiary opacity-40 group-hover:opacity-100"
                )} 
              />
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-widest transition-all duration-500",
                isActive ? "text-vora-accent opacity-100" : "text-vora-tertiary opacity-0 group-hover:opacity-40"
              )}>
                {item.name}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -inset-4 bg-vora-accent/5 blur-xl rounded-full z-[-1]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
