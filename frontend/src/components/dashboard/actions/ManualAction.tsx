"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, ChevronLeft, UtensilsCrossed, Scale, Flame, Target } from "lucide-react";
import api from "@/lib/api";
import { MealType } from "@prisma/client";

interface ManualActionProps {
  onSuccess: () => void;
}

export function ManualAction({ onSuccess }: ManualActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: 100,
    unit: "g",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    type: "BREAKFAST" as MealType,
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const foodRes = await api.post("/food/manual", {
        name: form.name,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
      });

      await api.post("/meal/log", {
        foodId: foodRes.data.id,
        type: form.type,
        amount: Number(form.amount),
        customName: form.name, // Senior dokunuşu: customName desteği
      });

      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 }),
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Progress Bar */}
      <div className="flex gap-1 mb-6 px-1 shrink-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-vora-accent" : "bg-white/5"}`} />
        ))}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.3em] px-1">Besin İsmi</label>
                  <div className="p-4 bg-vora-surface-raised border border-vora-border/10 rounded-[1.5rem] focus-within:border-vora-accent/30 transition-all">
                    <input
                      type="text"
                      autoFocus
                      placeholder="ÖRN: IZGARA TAVUK"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                      className="w-full bg-transparent outline-none text-sm font-bold tracking-widest text-vora-primary placeholder:opacity-20 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-vora-tertiary uppercase tracking-[0.3em] px-1">Miktar ({form.unit})</label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-4 bg-vora-surface-raised border border-vora-border/10 rounded-[1.5rem] focus-within:border-vora-accent/30 transition-all">
                      <input
                        type="number"
                        placeholder="100"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                        className="w-full bg-transparent outline-none text-sm font-bold tracking-widest text-vora-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-[1.5rem] border border-white/5">
                      {["g", "ml"].map((u) => (
                        <button
                          key={u}
                          onClick={() => setForm({ ...form, unit: u })}
                          className={`px-4 rounded-xl text-[10px] font-bold uppercase transition-all ${form.unit === u ? "bg-vora-accent text-white" : "text-vora-tertiary hover:bg-white/5"}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "KALORİ", key: "calories", icon: Flame, color: "text-vora-accent" },
                  { label: "PROTEİN", key: "protein", icon: Target, color: "text-vora-secondary" },
                  { label: "KARBONHİDRAT", key: "carbs", icon: Scale, color: "text-vora-warning" },
                  { label: "YAĞ", key: "fat", icon: Droplets, color: "text-vora-error" },
                ].map((item) => (
                  <div key={item.key} className="p-4 bg-white/[0.03] border border-vora-border/10 rounded-[2rem] space-y-3 focus-within:border-vora-accent/30 transition-all">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                      <span className="text-[7px] font-bold text-vora-tertiary uppercase tracking-widest">{item.label}</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={form[item.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
                      className="w-full bg-transparent outline-none text-xl font-black tracking-tighter text-vora-primary placeholder:opacity-10"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[7px] text-center text-vora-tertiary uppercase tracking-widest opacity-50 italic">
                Değerler 100{form.unit} üzerinden hesaplanacaktır
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "Kahvaltı", val: "BREAKFAST" },
                  { label: "Öğle Yemeği", val: "LUNCH" },
                  { label: "Akşam Yemeği", val: "DINNER" },
                  { label: "Atıştırmalık", val: "SNACK" },
                ].map((m) => (
                  <button
                    key={m.val}
                    onClick={() => setForm({ ...form, type: m.val as MealType })}
                    className={`w-full p-5 rounded-[2rem] border transition-all flex items-center justify-between group ${form.type === m.val ? "bg-vora-accent/10 border-vora-accent/40" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"}`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${form.type === m.val ? "text-vora-accent" : "text-vora-primary"}`}>{m.label}</span>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${form.type === m.val ? "border-vora-accent bg-vora-accent scale-110 shadow-[0_0_10px_rgba(var(--color-accent),0.4)]" : "border-vora-tertiary/30"}`} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-auto pt-6 flex gap-3 shrink-0 pb-1">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="p-5 bg-white/5 text-vora-primary rounded-[1.8rem] hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {step < 3 ? (
          <button
            onClick={nextStep}
            disabled={step === 1 && !form.name}
            className="flex-1 py-5 bg-vora-accent text-vora-on-accent rounded-[1.8rem] font-bold uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30"
          >
            Devam Et <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-5 bg-vora-accent text-vora-on-accent rounded-[1.8rem] font-bold uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-vora-accent/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? "KAYDEDİLİYOR..." : "ÖĞÜNÜ TAMAMLA"}
          </button>
        )}
      </div>
    </div>
  );
}
