"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Droplets, GlassWater, Waves, CupSoda, Plus, Minus } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";

interface WaterActionProps {
  onSuccess: () => void;
}

const waterPresets = [
  { id: "xs", label: "100 ML", amount: 100, icon: GlassWater },
  { id: "sm", label: "200 ML", amount: 200, icon: GlassWater },
  { id: "md", label: "250 ML", amount: 250, icon: Waves },
  { id: "lg", label: "330 ML", amount: 330, icon: CupSoda },
  { id: "xl", label: "500 ML", amount: 500, icon: Droplet },
  { id: "xxl", label: "1000 ML", amount: 1000, icon: Droplets },
];

export function WaterAction({ onSuccess }: WaterActionProps) {
  const [amount, setAmount] = useState<string>("250");
  const [loading, setLoading] = useState(false);
  const notify = useNotificationStore();

  const handleNumericInput = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 4);
    setAmount(cleaned);
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post("/meal/log-water", { amount: Number(amount) });
      notify.show(`${amount}ml su başarıyla eklendi.`, "success");
      onSuccess();
    } catch (err) {
      notify.show("Kayıt sırasında hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px] justify-between py-2">
      {/* Scroll-free Minimalist Grid */}
      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-3">
          {waterPresets.map((item) => (
            <button
              key={item.id}
              onClick={() => setAmount(item.amount.toString())}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all outline-none ${amount === item.amount.toString() ? "bg-vora-accent/10 border-vora-accent" : "bg-white/[0.02] border-vora-border/10 hover:bg-white/5"}`}
            >
              <item.icon className={`w-5 h-5 ${amount === item.amount.toString() ? "text-vora-accent" : "text-vora-tertiary opacity-40"}`} />
              <span className={`text-[8px] font-black tracking-widest ${amount === item.amount.toString() ? "text-vora-accent" : "text-vora-tertiary opacity-40"}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Minimalist Manual Input */}
        <div className="pt-4 border-t border-vora-border/5">
          <div className="relative group">
            <label className="text-[8px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-2 block opacity-30 group-focus-within:text-vora-accent transition-colors">Özel Miktar Ekle</label>
            <div className="flex items-center gap-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl px-5 py-3 group-focus-within:border-vora-accent/40 transition-all">
              <input 
                type="text" 
                inputMode="numeric" 
                value={amount} 
                onChange={(e) => handleNumericInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 bg-transparent outline-none text-xl font-black tracking-tighter text-vora-primary placeholder:opacity-5" 
                placeholder="ML cinsinden yazın..."
              />
              <span className="text-[10px] font-black text-vora-tertiary opacity-30 tracking-widest">ML</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !amount || Number(amount) <= 0}
        className="w-full py-5 bg-vora-accent text-vora-on-accent rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all outline-none disabled:opacity-20"
      >
        {loading ? "İŞLENİYOR..." : "HİDRASYON EKLE"}
      </button>
    </div>
  );
}
