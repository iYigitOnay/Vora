"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

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
  const strokeValue = Math.min(
    (consumed.calories / targets.calories) * 1000,
    1000,
  );

  return (
    <div className="flex flex-col md:flex-row items-center justify-around h-full text-vora-primary">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-white/5 fill-none"
            strokeWidth="6"
          />
          <motion.circle
            initial={{ strokeDasharray: "0 1000" }}
            animate={{
              strokeDasharray: `${(strokeValue / 1000) * 280} 1000`,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-vora-accent fill-none"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-4xl font-black tracking-tighter mb-0.5 text-vora-primary">
            {remainingCals}
          </p>
          <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">
            Kcal Kaldı
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-[280px]">
        <div>
          <p className="text-[8px] font-bold text-vora-tertiary uppercase mb-0.5 opacity-50">
            Günlük Hedef
          </p>
          <p className="text-lg font-bold tracking-tight">
            {targets.calories}{" "}
            <span className="text-[9px] text-vora-tertiary font-normal tracking-normal">
              kcal
            </span>
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold text-vora-tertiary uppercase mb-0.5 opacity-50">
            Toplam Alınan
          </p>
          <p className="text-lg font-bold tracking-tight">
            {consumed.calories}{" "}
            <span className="text-[9px] text-vora-tertiary font-normal tracking-normal">
              kcal
            </span>
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold text-vora-tertiary uppercase mb-0.5 opacity-50">
            Su Hedefi
          </p>
          <p className="text-lg font-bold text-vora-accent tracking-tight">
            {(targets.water / 1000).toFixed(1)}{" "}
            <span className="text-[9px] text-vora-tertiary font-normal tracking-normal">
              Litre
            </span>
          </p>
        </div>
        <div>
          <p className="text-[8px] font-bold text-vora-tertiary uppercase mb-0.5 opacity-50">
            İçilen Su
          </p>
          <p className="text-lg font-bold text-vora-accent tracking-tight">
            {(consumed.water / 1000).toFixed(1)}{" "}
            <span className="text-[9px] text-vora-tertiary font-normal tracking-normal">
              Litre
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
