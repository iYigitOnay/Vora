"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UtensilsCrossed, ChevronRight, ChevronLeft, Flame, Target, Droplets, Scale, X } from "lucide-react";
import api from "@/lib/api";
import { MealType } from "@prisma/client";

interface SearchActionProps {
  onSuccess: () => void;
}

export function SearchAction({ onSuccess }: SearchActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [form, setForm] = useState({
    amount: 100,
    type: "BREAKFAST" as MealType,
    customName: "",
  });

  // Canlı Arama (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        try {
          const res = await api.get(`/food/search?q=${query}`);
          setResults(res.data);
        } catch (err) {
          console.error("Arama hatası:", err);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (food: any) => {
    setSelectedFood(food);
    setForm({ ...form, customName: food.name });
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/meal/log", {
        foodId: selectedFood.id,
        type: form.type,
        amount: Number(form.amount),
        customName: form.customName,
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
      <AnimatePresence mode="wait" custom={step}>
        {step === 1 && (
          <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="flex flex-col h-full">
            {/* Arama Input */}
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[1.5rem] flex items-center gap-4 focus-within:border-vora-accent/30 transition-all mb-4 shrink-0">
              <Search className="w-5 h-5 text-vora-tertiary" />
              <input
                autoFocus
                type="text"
                placeholder="YEMEK VEYA BESİN ARA..."
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                className="flex-1 bg-transparent outline-none text-sm font-bold tracking-widest text-vora-primary placeholder:opacity-20 uppercase"
              />
              {query && <button onClick={() => setQuery("")} className="p-1 hover:bg-white/5 rounded-full"><X className="w-4 h-4 text-vora-tertiary" /></button>}
            </div>

            {/* Sonuç Listesi */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 pb-2">
              {results.length > 0 ? (
                results.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelect(food)}
                    className="w-full p-4 bg-white/[0.02] border border-white/5 rounded-[1.2rem] flex items-center justify-between group hover:bg-vora-accent/5 hover:border-vora-accent/20 transition-all"
                  >
                    <div className="flex items-center gap-4 text-left min-w-0">
                      <div className="p-2.5 bg-white/5 rounded-xl text-vora-tertiary group-hover:text-vora-accent transition-colors shrink-0">
                        <UtensilsCrossed className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-vora-primary tracking-tight truncate leading-tight">{food.name}</p>
                        <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest leading-none mt-1">{food.calories} KCAL / 100G</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors shrink-0" />
                  </button>
                ))
              ) : query.length > 1 ? (
                <div className="text-center py-10 opacity-30">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Sonuç Bulunamadı</p>
                </div>
              ) : (
                <div className="text-center py-10 opacity-30 space-y-2">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto"><Search className="w-5 h-5" /></div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Aramaya Başla...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && selectedFood && (
          <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
            <div className="p-5 bg-vora-accent/5 border border-vora-accent/20 rounded-[2rem] flex items-center gap-4">
              <div className="p-4 bg-vora-surface rounded-2xl border border-white/5">
                <UtensilsCrossed className="w-6 h-6 text-vora-accent opacity-50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[7px] font-bold text-vora-accent uppercase tracking-[0.3em] mb-1">BESİN DÜZENLEME</p>
                <input 
                  value={form.customName}
                  onChange={(e) => setForm({...form, customName: e.target.value.toUpperCase()})}
                  className="w-full bg-transparent text-sm font-black text-vora-primary outline-none tracking-tight leading-none truncate uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "KCAL", val: selectedFood.calories, color: "text-vora-accent" },
                { label: "PRO", val: selectedFood.protein, color: "text-vora-secondary" },
                { label: "KRB", val: selectedFood.carbs, color: "text-vora-warning" },
                { label: "YAĞ", val: selectedFood.fat, color: "text-vora-error" },
              ].map(m => (
                <div key={m.label} className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                  <p className={`text-[9px] font-black ${m.color}`}>{m.val}</p>
                  <p className="text-[6px] font-bold text-vora-tertiary uppercase tracking-tighter">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-[1.5rem] flex items-center justify-between focus-within:border-vora-accent/30 transition-all">
                <span className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest px-1">Miktar (g/ml)</span>
                <input 
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: Number(e.target.value)})}
                  className="w-20 bg-transparent text-right text-lg font-black text-vora-primary outline-none tracking-tighter"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setForm({...form, type: t as MealType})}
                    className={`p-3 rounded-2xl text-[8px] font-bold uppercase tracking-widest border transition-all ${form.type === t ? "bg-vora-accent text-white border-vora-accent shadow-lg shadow-vora-accent/20" : "bg-white/[0.02] border-white/5 text-vora-tertiary"}`}
                  >
                    {t === "BREAKFAST" ? "KAHVALTI" : t === "LUNCH" ? "ÖĞLE" : t === "DINNER" ? "AKŞAM" : "ARA ÖĞÜN"}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-full py-5 bg-vora-accent text-vora-on-accent rounded-[1.8rem] font-bold uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-vora-accent/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {loading ? "KAYDEDİLİYOR..." : "ÖĞÜNE EKLE"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 2 && (
        <button 
          onClick={() => setStep(1)}
          className="absolute top-0 left-0 p-2 text-vora-tertiary hover:text-vora-primary transition-colors z-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
