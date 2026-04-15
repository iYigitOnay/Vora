"use client";

import { motion } from "framer-motion";

interface MacroBalanceProps {
  macros: Array<{ label: string; val: number; target: number }>;
}

export function MacroBalance({ macros }: MacroBalanceProps) {
  return (
    <div className="space-y-6 pt-2 h-full flex flex-col justify-center">
      {macros.map((m) => {
        const pct = Math.round((m.val / m.target) * 100) || 0;
        const remaining = m.target - m.val;
        const isOver = remaining < 0;
        const barPct = Math.min(pct, 100);
        
        // Vora Senior Design: Distinctive roles for each macro
        const isProtein = m.label.toLowerCase().includes("protein");
        const isCarb = m.label.toLowerCase().includes("karbonhidrat");
        const isFat = m.label.toLowerCase().includes("yağ");

        const getBarColor = () => {
          if (isProtein) return "bg-vora-accent";
          if (isCarb) return "bg-vora-primary opacity-90";
          if (isFat) return "bg-vora-tertiary opacity-40";
          return "bg-vora-accent";
        };

        return (
          <div key={m.label} className="group cursor-default">
            {/* Action-Oriented Header: [% Focus] | [Remaining Action] */}
            <div className="flex justify-between items-end px-1 mb-2.5">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-vora-primary uppercase tracking-[0.2em]">
                    {m.label}
                  </span>
                  <span className="text-[8px] font-bold text-vora-accent opacity-60 tracking-widest">
                    %{pct}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`text-[10px] font-black tracking-[0.1em] uppercase ${isOver ? "text-red-400" : "text-vora-tertiary"}`}>
                  {isOver ? (
                    `${Math.abs(remaining)}g AŞILDI`
                  ) : (
                    <span className="flex items-center gap-1.5 justify-end">
                      <span className="text-vora-primary">{remaining}g</span>
                      <span className="opacity-40 italic lowercase font-bold">kaldı</span>
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            {/* Progress Bar with Selective Glow */}
            <div className="h-[5px] w-full bg-white/[0.03] rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full relative rounded-full ${getBarColor()} ${isProtein ? "shadow-[0_0_8px_rgba(var(--vora-accent-rgb),0.2)]" : ""}`}
              >
                {/* Subtle Over-target indicator */}
                {isOver && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-400/50 blur-[1px]" />
                )}
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
