"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Flame, Target, Droplets, Scale, Utensils } from "lucide-react";
import api from "@/lib/api";

interface ManualActionProps {
  onSuccess: () => void;
}

export function ManualAction({ onSuccess }: ManualActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    calories: "0",
    protein: "0",
    carbs: "0",
    fat: "0",
    amount: "100",
    type: "BREAKFAST",
  });

  const handleNumericInput = (field: string, val: string, maxChars: number = 5) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, maxChars);
    setForm({ ...form, [field]: cleaned || "0" });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Önce özel besini oluştur
      const foodRes = await api.post("/food/manual", {
        name: form.name,
        brand: form.brand,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        defaultAmount: 100,
      });

      // 2. Sonra bu besini öğüne ekle
      await api.post("/meal/log", {
        foodId: foodRes.data.id,
        type: form.type,
        amount: Number(form.amount),
      });

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative space-y-6 pt-2">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-light tracking-[0.3em] uppercase text-vora-primary">KİMLİK</h2>
              <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-40">Besin Adı ve Marka Belirleyin</p>
            </div>
            <div className="space-y-6">
              <div className="relative group">
                <label className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.4em] absolute -top-2 left-0 opacity-50">Besin Adı</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})} placeholder="ÖRN: ÖZEL KARIŞIM..." className="w-full bg-transparent border-b border-vora-border/20 py-4 outline-none text-xl font-black tracking-tighter text-vora-primary focus:border-vora-accent transition-all uppercase" />
              </div>
              <div className="relative group">
                <label className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.4em] absolute -top-2 left-0 opacity-50">Marka (Opsiyonel)</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value.toUpperCase()})} placeholder="ÖRN: EV YAPIMI..." className="w-full bg-transparent border-b border-vora-border/20 py-4 outline-none text-sm font-bold tracking-widest text-vora-primary focus:border-vora-accent transition-all uppercase" />
              </div>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div key="s2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-light tracking-[0.3em] uppercase text-vora-primary">MAKRO DEĞERLER</h2>
              <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-40">100g İçin Besin Değerlerini Girin</p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-8">
              <div className="relative group">
                <label className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mb-1 block">KALORİ (KCAL)</label>
                <div className="flex items-center gap-3 border-b border-vora-border/20 group-focus-within:border-vora-accent transition-all">
                  <Flame className="w-4 h-4 text-vora-tertiary opacity-30" />
                  <input type="text" inputMode="numeric" value={form.calories === "0" ? "" : form.calories} onChange={(e) => handleNumericInput('calories', e.target.value, 4)} placeholder="0" className="w-full bg-transparent py-3 outline-none text-xl font-black tracking-tighter text-vora-primary" />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mb-1 block">PROTEİN (G)</label>
                <div className="flex items-center gap-3 border-b border-vora-border/20 group-focus-within:border-vora-accent transition-all">
                  <Target className="w-4 h-4 text-vora-accent opacity-30" />
                  <input type="text" inputMode="numeric" value={form.protein === "0" ? "" : form.protein} onChange={(e) => handleNumericInput('protein', e.target.value, 3)} placeholder="0" className="w-full bg-transparent py-3 outline-none text-xl font-black tracking-tighter text-vora-primary" />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mb-1 block">KARBONHİDRAT (G)</label>
                <div className="flex items-center gap-3 border-b border-vora-border/20 group-focus-within:border-vora-accent transition-all">
                  <Droplets className="w-4 h-4 text-vora-tertiary opacity-30" />
                  <input type="text" inputMode="numeric" value={form.carbs === "0" ? "" : form.carbs} onChange={(e) => handleNumericInput('carbs', e.target.value, 3)} placeholder="0" className="w-full bg-transparent py-3 outline-none text-xl font-black tracking-tighter text-vora-primary" />
                </div>
              </div>
              <div className="relative group">
                <label className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mb-1 block">YAĞ (G)</label>
                <div className="flex items-center gap-3 border-b border-vora-border/20 group-focus-within:border-vora-accent transition-all">
                  <Scale className="w-4 h-4 text-vora-tertiary opacity-30" />
                  <input type="text" inputMode="numeric" value={form.fat === "0" ? "" : form.fat} onChange={(e) => handleNumericInput('fat', e.target.value, 3)} placeholder="0" className="w-full bg-transparent py-3 outline-none text-xl font-black tracking-tighter text-vora-primary" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="s3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8 text-center">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-light tracking-[0.3em] uppercase text-vora-primary">SON ADIM</h2>
              <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-40">Miktar ve Öğün Tipi Seçin</p>
            </div>
            <div className="space-y-8">
              <div className="relative group max-w-[200px] mx-auto">
                <label className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.4em] mb-2 block opacity-50">Tüketilen Miktar</label>
                <div className="flex items-end gap-3 border-b border-vora-border/20 group-focus-within:border-vora-accent transition-all pb-2">
                  <input type="text" inputMode="numeric" value={form.amount} onChange={(e) => handleNumericInput('amount', e.target.value, 5)} className="w-full bg-transparent text-center outline-none text-5xl font-black tracking-tighter text-vora-primary" />
                  <span className="text-[10px] font-bold text-vora-tertiary mb-2">G/ML</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                  <button key={t} onClick={() => setForm({...form, type: t})} className={`py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all border ${form.type === t ? "bg-vora-accent text-vora-on-accent border-vora-accent shadow-xl shadow-vora-accent/20" : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"}`}>
                    {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-10 mt-auto">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-vora-tertiary hover:text-vora-primary transition-all border border-vora-border/10 rounded-[2rem]">GERİ</button>
        )}
        <button 
          onClick={() => step < 3 ? setStep(step + 1) : handleFinalSubmit()}
          disabled={loading || (step === 1 && !form.name)}
          className="flex-[2] py-5 bg-vora-accent text-vora-on-accent rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[10px] shadow-xl shadow-vora-accent/10 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-20"
        >
          {loading ? "SİSTEME KAYDEDİLİYOR..." : step < 3 ? "İLERLE" : "KAYDI TAMAMLA"}
        </button>
      </div>
    </div>
  );
}
