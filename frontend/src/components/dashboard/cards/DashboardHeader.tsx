"use client";

import { Trophy, Cloud, Sun, CloudRain } from "lucide-react";

interface DashboardHeaderProps {
  user?: any;
  auraStreak?: number;
  weather?: any;
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ user, auraStreak = 0, weather, title, subtitle }: DashboardHeaderProps) {
  // Selamlama veya Özel Başlık
  const displayTitle = title || (user ? `SELAM ${user.firstName}` : "VORA");
  const displaySubtitle = subtitle || "BUGÜNKÜ AURA DENGEN MÜKEMMEL";

  const firstWord = displayTitle.split(' ')[0];
  const restOfTitle = displayTitle.split(' ').slice(1).join(' ');

  return (
    <header className="flex justify-between items-end mb-10 px-2 text-vora-primary shrink-0 group">
      <div className="space-y-2">
        <h1 className="text-4xl font-extralight tracking-[0.1em] uppercase leading-none">
          {firstWord} <span className="font-bold text-vora-accent drop-shadow-[0_0_15px_rgba(var(--color-accent),0.2)]">{restOfTitle}</span>
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-vora-tertiary text-[10px] tracking-[0.4em] uppercase opacity-40 font-bold italic group-hover:opacity-80 transition-opacity">
            {displaySubtitle}
          </p>
          {weather && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-full border border-vora-border/10">
              <Sun className="w-3 h-3 text-vora-accent opacity-50" />
              <span className="text-[10px] font-black text-vora-primary tracking-tighter">
                {weather.temperature}°C
              </span>
              <span className="text-[8px] text-vora-tertiary uppercase tracking-widest font-bold opacity-30">
                İSTANBUL
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.3em] opacity-30">
            Vora Flow
          </p>
          <p className="text-3xl font-black text-white tracking-tighter group-hover:text-vora-accent transition-colors">
            {auraStreak} <span className="text-[10px] font-normal text-vora-tertiary uppercase tracking-normal">GÜN</span>
          </p>
        </div>
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 bg-vora-accent/5 rounded-2xl border border-vora-accent/10 rotate-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute inset-0 bg-vora-surface border border-vora-border/20 rounded-2xl shadow-xl flex items-center justify-center text-vora-accent z-10 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
