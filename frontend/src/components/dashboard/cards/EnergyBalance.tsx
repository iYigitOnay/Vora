"use client";

import { motion } from "framer-motion";
import { Zap, Droplets } from "lucide-react";

interface EnergyBalanceProps {
  targets: {
    calories: number;
    water: number;
  };
  consumed: {
    calories: number;
    water: number;
  };
}

export function EnergyBalance({ targets, consumed }: EnergyBalanceProps) {
  const remainingCals = Math.max(targets.calories - consumed.calories, 0);
  const calPercentage = Math.min((consumed.calories / targets.calories) * 100, 100);
  const waterPercentage = Math.min((consumed.water / targets.water) * 100, 100);
  
  // SVG Ring Settings - Fixed geometry to prevent overlap
  const radius = 85;
  const innerRadius = 70;
  const circumference = 2 * Math.PI * radius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const calOffset = circumference - (calPercentage / 100) * circumference;
  const waterOffset = innerCircumference - (waterPercentage / 100) * innerCircumference;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between h-full px-2 gap-10">
      {/* Fusion Visualization - Double Ring */}
      <div className="relative w-64 h-64 flex items-center justify-center shrink-0 group">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {/* Energy Ring Background */}
          <circle
            cx="100" cy="100" r={radius}
            className="stroke-white/[0.03] fill-none"
            strokeWidth="10"
          />
          {/* Energy Ring Progress (Outer) - Theme Accent */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: calOffset }}
            transition={{ duration: 2, ease: "circOut" }}
            cx="100" cy="100" r={radius}
            className="stroke-vora-accent fill-none"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />

          {/* Water Ring Background */}
          <circle
            cx="100" cy="100" r={innerRadius}
            className="stroke-white/[0.03] fill-none"
            strokeWidth="8"
          />
          {/* Water Ring Progress (Inner) - Deep Ocean Blue */}
          <motion.circle
            initial={{ strokeDashoffset: innerCircumference }}
            animate={{ strokeDashoffset: waterOffset }}
            transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
            cx="100" cy="100" r={innerRadius}
            style={{ stroke: '#0EA5E9' }}
            className="fill-none"
            strokeWidth="8"
            strokeDasharray={innerCircumference}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Central Data Center */}
        <div className="absolute flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl font-black text-vora-primary leading-none tracking-tighter">
              {remainingCals}
            </span>
            <span className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.4em] mt-3 opacity-60">
              KALAN ENERJİ
            </span>
            </motion.div>
            </div>
      </div>

      {/* Fusion Details Grid */}
      <div className="flex-1 w-full max-w-sm space-y-8">
        {/* Energy Row */}
        <div className="relative pl-6 border-l-2 border-vora-accent/20">
          <div className="absolute -left-1 top-0 w-2 h-2 bg-vora-accent rounded-full shadow-[0_0_10px_rgba(var(--color-accent),0.5)]" />
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-vora-accent" />
              <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">KALORİ TAKİBİ</p>
            </div>
            <p className="text-xl font-black text-vora-primary tracking-tighter">
              {consumed.calories} <span className="text-[10px] font-normal text-vora-tertiary">/ {targets.calories} KCAL</span>
            </p>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${calPercentage}%` }}
              className="h-full bg-vora-accent" 
            />
          </div>
        </div>

        {/* Hydration Row */}
        <div className="relative pl-6 border-l-2 border-[#0EA5E9]/20">
          <div className="absolute -left-1 top-0 w-2 h-2 bg-[#0EA5E9] rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">SU TÜKETİMİ</p>
            </div>
            <p className="text-xl font-black text-vora-primary tracking-tighter">
              {(consumed.water / 1000).toFixed(1)} <span className="text-[10px] font-normal text-vora-tertiary">/ {(targets.water / 1000).toFixed(1)} LİTRE</span>
            </p>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${waterPercentage}%` }}
              className="h-full bg-[#0EA5E9]" 
            />
          </div>
        </div>

        {/* Global Efficiency */}
        <div className="pt-4 border-t border-vora-border/10 flex justify-between items-center">
           <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-40">GÜNLÜK METABOLİK VERİMLİLİK</p>
           <p className="text-[11px] font-black text-vora-accent tracking-widest">%{((calPercentage + waterPercentage) / 2).toFixed(0)} TAMAMLANDI</p>
        </div>
      </div>
    </div>
  );
}
