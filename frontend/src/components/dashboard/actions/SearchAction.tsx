"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UtensilsCrossed, ChevronRight, ChevronLeft, Plus, Minus, X, Utensils, User, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";

interface SearchActionProps {
  onSuccess: () => void;
  initialMealType?: string;
}

const SourceTag = ({ isGlobal }: { isGlobal: boolean }) => {
  if (!isGlobal) return (
    <div className="flex items-center gap-1 text-[7px] font-black text-vora-secondary tracking-widest uppercase bg-vora-secondary/5 px-2 py-0.5 rounded-full border border-vora-secondary/10 mt-1">
      <User className="w-2.5 h-2.5" /> SENİN ÖZEL TARİFİN
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-[7px] font-bold text-vora-accent tracking-widest uppercase bg-vora-accent/5 px-2 py-0.5 rounded-full border border-vora-accent/10 mt-1">
      <ShieldCheck className="w-2.5 h-2.5" /> VORA GENEL KÜTÜPHANE
    </div>
  );
};

export function SearchAction({ onSuccess, initialMealType }: SearchActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");
  const [mealType, setMealType] = useState(initialMealType || "BREAKFAST");
  const notify = useNotificationStore();

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
    setAmount(food.defaultAmount?.toString() || "100");
    setStep(2);
  };

  const handleNumericInput = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 5);
    setAmount(cleaned);
  };

  const handleFinalSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post("/meal/log", {
        foodId: selectedFood.id,
        type: mealType,
        amount: Number(amount),
      });
      notify.show("Öğün eklendi.", "success");
      onSuccess();
    } catch (err) {
      notify.show("Kayıt hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const calc = (base: number) => Math.round((base / 100) * (Number(amount) || 0));

  return (
    <div className="flex flex-col h-[420px] justify-between pb-2">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col h-full">
            <div className="relative group shrink-0 mb-4">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-vora-tertiary group-focus-within:text-vora-accent transition-colors" />
              <input autoFocus type="text" placeholder="BESİN VEYA YEMEK ARA..." value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} className="w-full bg-white/[0.03] border border-vora-border/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-vora-accent/40 transition-all text-vora-primary font-bold tracking-widest placeholder:opacity-10 text-xs uppercase" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-2 pb-2">
              {results.length > 0 ? (
                results.map((food) => (
                  <button key={food.id} onClick={() => handleSelect(food)} className="w-full p-4 bg-white/[0.02] border border-vora-border/5 rounded-2xl flex items-center justify-between group hover:bg-vora-accent/[0.04] transition-all outline-none" >
                    <div className="flex items-center gap-4 text-left min-w-0">
                      <div className="p-3 bg-white/5 rounded-xl text-vora-tertiary group-hover:text-vora-accent transition-colors shrink-0">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-vora-primary tracking-tight truncate leading-tight uppercase">{food.name}</p>
                        <SourceTag isGlobal={food.isGlobal} />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-all shrink-0" />
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10 space-y-4">
                  <Search className="w-8 h-8" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-center">Besin havuzu seni bekliyor</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col h-full justify-center space-y-4" >
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[9px] font-black uppercase tracking-widest w-fit outline-none group mb-1" >
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> GERİ DÖN
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2.5rem] p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-vora-accent/10 rounded-xl border border-vora-accent/10">
                  <Utensils className="w-5 h-5 text-vora-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <SourceTag isGlobal={selectedFood.isGlobal} />
                  <h3 className="text-lg font-black text-vora-primary tracking-tighter truncate uppercase mt-0.5">{selectedFood.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "KCAL", val: calc(selectedFood.calories) },
                  { label: "PRO", val: calc(selectedFood.protein) },
                  { label: "KRB", val: calc(selectedFood.carbs) },
                  { label: "YAĞ", val: calc(selectedFood.fat) },
                ].map(m => (
                  <div key={m.label} className="p-2 bg-white/5 border border-white/5 rounded-xl text-center">
                    <p className="text-base font-black tracking-tighter text-vora-primary">{m.val}</p>
                    <p className="text-[7px] font-bold text-vora-tertiary uppercase tracking-widest">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-vora-border/10 rounded-xl">
                <button onClick={() => handleNumericInput((Number(amount) - 10).toString())} className="p-2.5 hover:bg-white/10 rounded-lg text-vora-tertiary outline-none active:scale-90"><Minus className="w-4 h-4" /></button>
                <div className="flex-1 text-center">
                  <input autoFocus type="text" inputMode="numeric" value={amount} onChange={(e) => handleNumericInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()} className="w-full bg-transparent text-center text-3xl font-black text-vora-primary outline-none tracking-tighter" placeholder="0" />
                  <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-[0.2em]">GRAM / ML</p>
                </div>
                <button onClick={() => handleNumericInput((Number(amount) + 10).toString())} className="p-2.5 hover:bg-white/10 rounded-lg text-vora-tertiary outline-none active:scale-90"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 px-1">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                <button key={t} onClick={() => setMealType(t)} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border outline-none ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent" : "bg-white/[0.02] border-vora-border/5 text-vora-tertiary hover:bg-white/5"}`} >
                  {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                </button>
              ))}
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-4 bg-vora-accent text-vora-on-accent rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg outline-none disabled:opacity-20 hover:brightness-110 active:scale-[0.98] transition-all" >
              {loading ? "İŞLENİYOR..." : "ÖĞÜNE EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
