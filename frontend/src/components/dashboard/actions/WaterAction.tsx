"use client";

import { useState } from "react";
import { Droplets, GlassWater, Waves, Plus, Minus } from "lucide-react";
import api from "@/lib/api";

interface WaterActionProps {
  onSuccess: () => void;
}

const PRESETS = [
  { label: "BARDAK", amount: 200, icon: GlassWater },
  { label: "ŞİŞE", amount: 330, icon: Waves },
  { label: "STANDART", amount: 500, icon: Droplets },
  { label: "BÜYÜK", amount: 1000, icon: Droplets },
];

export function WaterAction({ onSuccess }: WaterActionProps) {
  const [amount, setAmount] = useState<number>(250);
  const [loading, setLoading] = useState(false);

  const handleAddWater = async (val: number) => {
    setLoading(true);
    try {
      await api.post("/meal/log-water", { amount: val });
      onSuccess();
    } catch (err) {
      console.error("Su eklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hızlı Seçim Grid - Maksimum Kompaktlık */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.amount}
            onClick={() => handleAddWater(preset.amount)}
            disabled={loading}
            className="group p-3 bg-white/[0.02] border border-vora-border/10 rounded-[1.5rem] hover:bg-vora-accent/5 hover:border-vora-accent/30 transition-all flex items-center gap-3 text-left"
          >
            <div className="p-2 bg-vora-accent/5 text-vora-accent rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <preset.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-vora-tertiary uppercase tracking-widest truncate">
                {preset.label}
              </p>
              <p className="text-base font-black text-vora-primary tracking-tighter leading-none">
                {preset.amount}<span className="text-[8px] font-normal text-vora-tertiary ml-0.5 tracking-normal">ml</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Manuel Giriş Bölümü */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-[7px] font-bold text-vora-tertiary uppercase tracking-[0.3em]">
            Özel Miktar
          </p>
          <p className="text-[10px] font-bold text-vora-accent tracking-tighter uppercase">
            {amount} Mililitre
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-vora-border/10 rounded-[1.2rem] focus-within:border-vora-accent/30 transition-all">
          <button
            onClick={() => setAmount(Math.max(50, amount - 50))}
            className="p-3 hover:bg-white/5 rounded-lg text-vora-tertiary transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 bg-transparent text-center text-lg font-black tracking-tighter outline-none text-vora-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onClick={() => setAmount(amount + 50)}
            className="p-3 hover:bg-white/5 rounded-lg text-vora-tertiary transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onay Butonu - Sticky alt kısım gibi en alta yapışık */}
      <div className="mt-auto pb-1">
        <button
          onClick={() => handleAddWater(amount)}
          disabled={loading}
          className="w-full py-4 bg-vora-accent text-vora-on-accent rounded-[1.5rem] font-bold uppercase tracking-[0.3em] text-[9px] shadow-lg shadow-vora-accent/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? "KAYDEDİLİYOR..." : "SUYU KAYDET"}
        </button>
      </div>
    </div>
  );
}
