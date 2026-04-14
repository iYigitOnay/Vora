"use client";

import { motion } from "framer-motion";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";

interface WeekStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeekStrip({ selectedDate, onDateChange }: WeekStripProps) {
  // Vora Standard: Last 7 days including today
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-4 overflow-x-auto no-scrollbar mb-6">
      {days.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayName = format(day, "EEE", { locale: tr }).toUpperCase();
        const dayNum = format(day, "d");

        return (
          <motion.button
            key={day.toISOString()}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateChange(day)}
            className={`flex-1 min-w-[50px] flex flex-col items-center gap-2 py-4 rounded-[2rem] transition-all border outline-none ${
              isSelected 
                ? "bg-vora-accent border-vora-accent text-vora-on-accent shadow-lg shadow-vora-accent/20" 
                : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"
            }`}
          >
            <span className={`text-[8px] font-black tracking-widest ${isSelected ? "opacity-100" : "opacity-40"}`}>
              {dayName}
            </span>
            <span className={`text-lg font-black tracking-tighter ${isSelected ? "text-vora-on-accent" : "text-vora-primary"}`}>
              {dayNum}
            </span>
            {isSelected && (
              <motion.div 
                layoutId="active-dot"
                className="w-1 h-1 rounded-full bg-vora-on-accent mt-1" 
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
