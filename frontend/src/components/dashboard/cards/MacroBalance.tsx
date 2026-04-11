"use client";

import { motion } from "framer-motion";

interface MacroBalanceProps {
  macros: Array<{ label: string; val: number; target: number }>;
}

export function MacroBalance({ macros }: MacroBalanceProps) {
  return (
    <div className="space-y-5 pt-2 text-vora-primary h-full flex flex-col justify-center">
      {macros.map((m) => {
        const pct = Math.min((m.val / m.target) * 100, 100) || 0;
        return (
          <div key={m.label} className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
              <span className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest">
                {m.label}
              </span>
              <span className="text-[11px] font-bold">
                {m.val}g{" "}
                <span className="text-[8px] text-vora-tertiary font-normal">
                  / {m.target}g
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                className="h-full bg-vora-accent"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
