"use client";

import { motion } from "framer-motion";
import { Plus, Droplets } from "lucide-react";

interface HydrationStatusProps {
  consumed: { water: number };
  targets: { water: number };
  onAddClick: () => void;
}

export function HydrationStatus({ consumed, targets, onAddClick }: HydrationStatusProps) {
  const remainingMl = Math.max(targets.water - consumed.water, 0);
  const remainingCups = Math.ceil(remainingMl / 250);
  const pct = Math.min((consumed.water / targets.water) * 100, 100);
  const isSignificantOver = consumed.water - targets.water >= 500;

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden group">
      {/* Background Fluid Level - Senior Animation */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${pct}%` }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute bottom-0 left-0 right-0 z-0 transition-colors duration-1000 ${
          isSignificantOver ? "bg-red-500/10" : "bg-vora-accent/5"
        }`}
      >
        {/* Subtle Wave Top Edge */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] blur-[1px] ${
          isSignificantOver ? "bg-red-400/30" : "bg-vora-accent/10"
        }`} />
      </motion.div>

      {/* Top Layer: Action Info & Button */}
      <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-20">
        <div className="flex flex-col gap-1">
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${
            isSignificantOver ? "text-red-400" : "text-vora-accent"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isSignificantOver ? "bg-red-400" : "bg-vora-accent"
            }`} />
            {remainingMl > 0 
              ? `${remainingCups} BARDAK KALDI` 
              : isSignificantOver 
                ? "AŞIRI HİDRASYON" 
                : "HEDEF TAMAM"}
          </span>
          <p className="text-[8px] font-bold text-vora-tertiary opacity-30 uppercase tracking-widest ml-3.5">
            GÜNLÜK HİDRASYON
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddClick}
          className="p-3 bg-white/[0.03] border border-white/5 rounded-full text-vora-primary hover:bg-vora-accent hover:text-vora-on-accent transition-colors outline-none"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Middle Layer: The Focused Liter */}
      <div className="relative z-10 flex flex-col items-center mt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-baseline"
        >
          <span className="text-7xl font-black tracking-tighter text-vora-primary">
            {(consumed.water / 1000).toFixed(1)}
          </span>
          <span className="text-xl font-bold text-vora-tertiary opacity-20 ml-2 tracking-tighter italic">
            L
          </span>
        </motion.div>
        
        <div className="mt-2 px-4 py-1 bg-white/[0.02] border border-white/5 rounded-full">
          <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-[0.4em] opacity-40">
            {consumed.water} / {targets.water} ML
          </p>
        </div>
      </div>

      {/* Decorative Drop Icon - Subtle Watermark */}
      <Droplets className="absolute -bottom-4 -right-4 w-24 h-24 text-vora-accent opacity-[0.02] -rotate-12 pointer-events-none" />
    </div>
  );
}
