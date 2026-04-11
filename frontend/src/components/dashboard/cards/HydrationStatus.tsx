"use client";

import { Plus } from "lucide-react";

interface HydrationStatusProps {
  consumed: { water: number };
  targets: { water: number };
  onAddClick: () => void;
}

export function HydrationStatus({ consumed, targets, onAddClick }: HydrationStatusProps) {
  return (
    <div className="flex items-center justify-between h-full px-2 text-vora-primary">
      <div className="flex items-center gap-10">
        <div className="text-center">
          <p className="text-4xl font-black tracking-tighter">
            {(consumed.water / 1000).toFixed(1)}
          </p>
          <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-widest">
            Litre
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
            const isFilled = (consumed.water / targets.water) * 12 >= i;
            return (
              <div
                key={i}
                className={`w-2.5 h-10 rounded-full transition-all duration-700 ${isFilled ? "bg-vora-accent shadow-[0_0_15px_rgba(var(--color-accent),0.4)]" : "bg-white/5"}`}
              />
            );
          })}
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="p-5 bg-vora-accent rounded-2xl text-white shadow-xl shadow-vora-accent/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
