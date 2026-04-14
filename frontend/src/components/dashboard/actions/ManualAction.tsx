"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Flame, Target, Droplets, Scale } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";

interface ManualActionProps {
  onSuccess: () => void;
}

export function ManualAction({ onSuccess }: ManualActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const notify = useNotificationStore();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    amount: "100",
    type: "BREAKFAST",
  });

  const handleNumericInput = (field: string, val: string, maxChars: number = 5) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, maxChars);
    setForm({ ...form, [field]: cleaned });
  };

  const isStep1Valid = form.name.trim().length > 0;
  const isStep2Valid = form.calories !== "" || form.protein !== "" || form.carbs !== "" || form.fat !== "";

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
    setStep(step + 1);
  };

  const handleFinalSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    setLoading(true);
    try {
      const foodRes = await api.post("/food/manual", {
        name: form.name,
        brand: form.brand,
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        defaultAmount: 100,
      });

      await api.post("/meal/log", {
        foodId: foodRes.data.id,
        type: form.type,
        amount: Number(form.amount),
      });

      notify.show("Özel tarifin eklendi.", "success");
      onSuccess();
    } catch (err) {
      notify.show("Kayıt hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between py-6">
      {/* Centered Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-16">
              <div className="space-y-12">
                <div className="relative group">
                  <label className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-4 block opacity-30 group-focus-within:text-vora-accent transition-colors">Besin Adı</label>
                  <input autoFocus type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})} onKeyDown={(e) => e.key === 'Enter' && handleNextStep()} placeholder="ÖRN: ÖZEL KARIŞIM..." className="w-full bg-transparent border-b border-vora-border/20 py-4 outline-none text-2xl font-bold tracking-widest text-vora-primary focus:border-vora-accent transition-all uppercase placeholder:opacity-5" />
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-4 block opacity-30 group-focus-within:text-vora-accent transition-colors">Marka (Opsiyonel)</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value.toUpperCase()})} onKeyDown={(e) => e.key === 'Enter' && handleNextStep()} placeholder="ÖRN: EV YAPIMI..." className="w-full bg-transparent border-b border-vora-border/20 py-4 outline-none text-sm font-bold tracking-widest text-vora-primary focus:border-vora-accent transition-all uppercase placeholder:opacity-5" />
                </div>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-x-12 gap-y-12">
              {[
                { field: 'calories', label: 'KCAL', color: 'text-vora-primary', max: 4 },
                { field: 'protein', label: 'PRO (G)', color: 'text-vora-accent', max: 3 },
                { field: 'carbs', label: 'KRB (G)', color: 'text-vora-primary', max: 3 },
                { field: 'fat', label: 'YAĞ (G)', color: 'text-vora-primary', max: 3 },
              ].map((input) => (
                <div key={input.field} className="relative group">
                  <label className="text-[9px] font-black text-vora-tertiary uppercase tracking-[0.3em] mb-2 block opacity-40">{input.label}</label>
                  <input autoFocus={input.field === 'calories'} type="text" inputMode="numeric" value={(form as any)[input.field]} onChange={(e) => handleNumericInput(input.field, e.target.value, input.max)} onKeyDown={(e) => e.key === 'Enter' && handleNextStep()} placeholder="0" className={`w-full bg-transparent border-b border-vora-border/20 py-3 outline-none text-2xl font-black tracking-tighter ${input.color} focus:border-vora-accent transition-all placeholder:opacity-5`} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-16">
              <div className="relative group max-w-[220px] mx-auto text-center">
                <label className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-4 block opacity-30">MİKTAR (G/ML)</label>
                <input autoFocus type="text" inputMode="numeric" value={form.amount} onChange={(e) => handleNumericInput('amount', e.target.value, 5)} onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()} className="w-full bg-transparent text-center outline-none text-6xl font-black tracking-tighter text-vora-primary" />
                <div className="h-0.5 w-full bg-vora-accent/20 mt-4" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                  <button key={t} onClick={() => setForm({...form, type: t as any})} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border outline-none ${form.type === t ? "bg-vora-accent text-vora-on-accent border-vora-accent" : "bg-white/[0.02] border-vora-border/10 text-vora-tertiary"}`}>
                    {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Navigation Footer (Within Main Area) */}
      <div className="flex gap-4 shrink-0 mt-8 mb-4">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-vora-tertiary hover:text-vora-primary transition-all border border-vora-border/10 rounded-2xl outline-none">GERİ</button>
        )}
        <button 
          onClick={() => step < 3 ? handleNextStep() : handleFinalSubmit()}
          disabled={loading || (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
          className="flex-[2] py-4 bg-vora-accent text-vora-on-accent rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] shadow-lg shadow-vora-accent/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20 outline-none"
        >
          {loading ? "İŞLENİYOR..." : step < 3 ? "İLERLE" : "TAMAMLA"}
        </button>
      </div>
    </div>
  );
}
