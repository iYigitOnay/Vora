"use client";

import { useState, useEffect } from "react";
import { Droplets, GlassWater, Waves, Plus, Minus, Coffee, Wine } from "lucide-react";
import api from "@/lib/api";

interface WaterActionProps {
  onSuccess: () => void;
}

const PRESETS = [
  { label: "KÜÇÜK BARDAK", amount: 150, icon: GlassWater },
  { label: "STANDART BARDAK", amount: 250, icon: GlassWater },
  { label: "BÜYÜK BARDAK", amount: 330, icon: GlassWater },
  { label: "KÜÇÜK ŞİŞE", amount: 500, icon: Waves },
  { label: "STANDART ŞİŞE", amount: 750, icon: Waves },
  { label: "BÜYÜK ŞİŞE", amount: 1000, icon: Waves },
];

export function WaterAction({ onSuccess }: WaterActionProps) {
  const [amount, setAmount] = useState<number>(250);
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<{ consumed: number; target: number } | null>(null);

  const fetchWaterStats = async () => {
    try {
      const res = await api.get("/dashboard/summary");
      setDailyData({
        consumed: res.data.consumed.water,
        target: res.data.targets.water
      });
    } catch (err) {
      console.error("Su verisi çekilemedi:", err);
    }
  };

  useEffect(() => {
    fetchWaterStats();
  }, []);

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

  const progress = dailyData ? Math.min((dailyData.consumed / dailyData.target) * 100, 100) : 0;

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Günlük Durum Özeti */}
      {dailyData && (
        <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2rem] p-6 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.2em] mb-1">Günlük Durum</p>
              <h3 className="text-2xl font-black text-vora-primary tracking-tighter">
                {(dailyData.consumed / 1000).toFixed(1)} <span className="text-sm font-normal text-vora-tertiary">/ {(dailyData.target / 1000).toFixed(1)} Litre</span>
              </h3>
            </div>
            <p className="text-xs font-bold text-vora-accent uppercase tracking-widest leading-loose">
              %{progress.toFixed(0)} TAMAMLANDI
            </p>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-vora-accent shadow-[0_0_15px_rgba(var(--color-accent),0.4)] transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Hızlı Seçim Grid */}
      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.amount + preset.label}
            onClick={() => handleAddWater(preset.amount)}
            disabled={loading}
            className="group p-4 bg-white/[0.02] border border-vora-border/10 rounded-[1.8rem] hover:bg-vora-accent/[0.05] hover:border-vora-accent/30 transition-all flex items-center gap-4 text-left"
          >
            <div className="p-3 bg-vora-accent/5 text-vora-accent rounded-2xl group-hover:scale-110 transition-transform shrink-0">
              <preset.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest truncate mb-0.5">
                {preset.label}
              </p>
              <p className="text-lg font-black text-vora-primary tracking-tighter leading-none">
                {preset.amount}<span className="text-[10px] font-normal text-vora-tertiary ml-0.5 tracking-normal">ml</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Manuel Giriş ve Onay */}
      <div className="mt-auto space-y-4 pt-4">
        <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-vora-border/10 rounded-[2rem]">
          <button
            onClick={() => setAmount(Math.max(50, amount - 50))}
            className="p-4 hover:bg-white/5 rounded-2xl text-vora-tertiary transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-transparent text-center text-2xl font-black tracking-tighter outline-none text-vora-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">Özel Miktar (ml)</p>
          </div>

          <button
            onClick={() => setAmount(amount + 50)}
            className="p-4 hover:bg-white/5 rounded-2xl text-vora-tertiary transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => handleAddWater(amount)}
          disabled={loading}
          className="w-full py-5 bg-vora-accent text-vora-on-accent rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-vora-accent/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? "KAYDEDİLİYOR..." : "TÜKETİMİ KAYDET"}
        </button>
      </div>
    </div>
  );
}
