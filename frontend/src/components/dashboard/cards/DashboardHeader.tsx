"use client";

import { Trophy } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
  auraStreak: number;
  weather: any;
}

export function DashboardHeader({ user, auraStreak, weather }: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 px-2 text-vora-primary shrink-0">
      <div className="space-y-1">
        <h1 className="text-4xl font-extralight tracking-tight uppercase">
          Selam <span className="font-bold">{user.firstName}</span>
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-vora-tertiary text-[10px] tracking-[0.3em] uppercase opacity-60 font-bold italic">
            Bugünkü aura dengen mükemmel
          </p>
          {weather && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
              <span className="text-[9px] font-bold text-vora-accent">
                {weather.temperature}°C
              </span>
              <span className="text-[8px] text-vora-tertiary uppercase tracking-tighter">
                İstanbul
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-widest">
            Vora Flow
          </p>
          <p className="text-2xl font-bold text-vora-accent tracking-tighter">
            {auraStreak} Gün
          </p>
        </div>
        <div className="w-12 h-12 bg-vora-accent/10 rounded-full flex items-center justify-center border border-vora-accent/20 text-vora-accent shadow-[0_0_20px_rgba(var(--color-accent),0.1)]">
          <Trophy className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
}
