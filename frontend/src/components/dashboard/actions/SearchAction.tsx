"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UtensilsCrossed, ChevronRight, ChevronLeft, Plus, Minus, X, Utensils, ShieldCheck, Users, User } from "lucide-react";
import api from "@/lib/api";
import { MealType } from "@prisma/client";
import { useNotificationStore } from "@/store/useNotificationStore";

interface SearchActionProps {
  onSuccess: () => void;
}

const SourceTag = ({ status }: { status: string }) => {
  if (status === 'VERIFIED') return (
    <div className="flex items-center gap-1 text-[7px] font-black text-vora-accent tracking-widest uppercase bg-vora-accent/5 px-2 py-0.5 rounded-full border border-vora-accent/10">
      <ShieldCheck className="w-2.5 h-2.5" /> VORA ONAYLI
    </div>
  );
  if (status === 'PRIVATE') return (
    <div className="flex items-center gap-1 text-[7px] font-black text-vora-secondary tracking-widest uppercase bg-vora-secondary/5 px-2 py-0.5 rounded-full border border-vora-secondary/10">
      <User className="w-2.5 h-2.5" /> SENİN ÖZEL TARİFİN
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-[7px] font-bold text-vora-tertiary tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
      <Users className="w-2.5 h-2.5" /> KULLANICI EKLEDİ
    </div>
  );
};

export function SearchAction({ onSuccess }: SearchActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
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
      notify.show("Öğün başarıyla eklendi.", "success");
      onSuccess();
    } catch (err) {
      notify.show("Kayıt sırasında bir sorun oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const calc = (base: number) => Math.round((base / 100) * (Number(amount) || 0));

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col h-full space-y-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-vora-tertiary group-focus-within:text-vora-accent transition-colors" />
              <input
                autoFocus
                type="text"
                placeholder="BESİN VEYA YEMEK ARA..."
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                className="w-full bg-white/[0.03] border border-vora-border/10 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-vora-accent/40 transition-all text-vora-primary font-bold tracking-widest placeholder:opacity-20 uppercase text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
              {results.length > 0 ? (
                results.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelect(food)}
                    className="w-full p-5 bg-white/[0.02] border border-vora-border/5 rounded-[1.8rem] flex items-center justify-between group hover:bg-vora-accent/[0.04] hover:border-vora-accent/20 transition-all"
                  >
                    <div className="flex items-center gap-4 text-left min-w-0">
                      <div className="p-3 bg-white/5 rounded-2xl text-vora-tertiary group-hover:text-vora-accent transition-colors shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <p className="text-sm font-black text-vora-primary tracking-tight truncate uppercase leading-tight">{food.name}</p>
                           <SourceTag status={food.status} />
                        </div>
                        <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest leading-none">{Math.round(food.calories)} KCAL / 100G</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-vora-tertiary group-hover:text-vora-accent group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))
              ) : query.length > 1 ? (
                <div className="text-center py-20 opacity-30 italic text-xs text-vora-tertiary uppercase tracking-widest">Sonuç bulunamadı</div>
              ) : (
                <div className="text-center py-20 opacity-30 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5"><Search className="w-6 h-6" /></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Binlerce besin seni bekliyor</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full space-y-6" >
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[10px] font-bold uppercase tracking-widest w-fit mb-2" >
              <ChevronLeft className="w-4 h-4" /> ARAMA LİSTESİNE DÖN
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2.5rem] p-8 space-y-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-vora-accent/10 rounded-[1.5rem] border border-vora-accent/10">
                  <Utensils className="w-6 h-6 text-vora-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1"><SourceTag status={selectedFood.status} /></div>
                  <h3 className="text-2xl font-black text-vora-primary tracking-tighter truncate leading-none uppercase">{selectedFood.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "KCAL", val: calc(selectedFood.calories), color: "text-vora-primary" },
                  { label: "PRO", val: calc(selectedFood.protein) + "g", color: "text-vora-accent" },
                  { label: "KRB", val: calc(selectedFood.carbs) + "g", color: "text-vora-primary" },
                  { label: "YAĞ", val: calc(selectedFood.fat) + "g", color: "text-vora-primary" },
                ].map(m => (
                  <div key={m.label} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <p className={`text-lg font-black tracking-tighter ${m.color}`}>{m.val}</p>
                    <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-2 bg-white/5 border border-vora-border/10 rounded-[2rem]">
                <button onClick={() => handleNumericInput((Number(amount) - 10).toString())} className="p-4 hover:bg-white/10 rounded-2xl text-vora-tertiary transition-all"><Minus className="w-5 h-5" /></button>
                <div className="flex-1 text-center">
                  <input 
                    type="text" 
                    inputMode="numeric" 
                    value={amount} 
                    onChange={(e) => handleNumericInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
                    className="w-full bg-transparent text-center text-3xl font-black text-vora-primary outline-none tracking-tighter placeholder:opacity-10" 
                    placeholder="0" 
                  />
                  <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">GRAM / ML</p>
                </div>
                <button onClick={() => handleNumericInput((Number(amount) + 10).toString())} className="p-4 hover:bg-white/10 rounded-2xl text-vora-tertiary transition-all"><Plus className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                <button key={t} onClick={() => setMealType(t as MealType)} className={`py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all border ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent shadow-xl shadow-vora-accent/20" : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"}`} >
                  {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                </button>
              ))}
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-5 bg-vora-accent text-vora-on-accent rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[10px] shadow-xl shadow-vora-accent/10 hover:scale-[1.01] active:scale-[0.99] transition-all mt-auto disabled:opacity-20" >
              {loading ? "SİSTEME KAYDEDİLİYOR..." : "ÖĞÜNE EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
