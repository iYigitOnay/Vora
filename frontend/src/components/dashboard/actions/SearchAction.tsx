"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UtensilsCrossed, ChevronRight, ChevronLeft, Plus, Minus, X, Utensils, User, ShieldCheck, Home } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAppStore } from "@/store/useAppStore";

interface SearchActionProps {
  onSuccess: () => void;
  initialMealType?: string;
}

const SourceTag = ({ status }: { status: string }) => {
  if (status === 'VERIFIED') return (
    <div className="flex items-center gap-1.5 text-[7px] font-black text-vora-success tracking-[0.2em] uppercase mb-1">
      <ShieldCheck className="w-3 h-3" /> VORA BARKOD
    </div>
  );
  if (status === 'PRIVATE') return (
    <div className="flex items-center gap-1.5 text-[7px] font-black text-vora-accent tracking-[0.2em] uppercase mb-1">
      <User className="w-3 h-3" /> SENİN TARİFİN
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 text-[7px] font-bold text-vora-tertiary tracking-[0.2em] uppercase mb-1 opacity-50">
      <Utensils className="w-3 h-3" /> TOPLULUK VERİSİ
    </div>
  );
};

// ... (Step 2 içindeki selectedFood başlık kısmından sonra eklenecek bilgilendirme bölümü)
const InfoNotice = ({ status }: { status: string }) => {
  if (status === 'VERIFIED') return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-vora-success/5 border border-vora-success/10 rounded-xl flex items-start gap-3">
      <ShieldCheck className="w-4 h-4 text-vora-success shrink-0 mt-0.5" />
      <p className="text-[9px] font-medium text-vora-success/80 leading-relaxed uppercase tracking-tight">
        Bu besin verileri Vora Kütüphanesi tarafından doğrulanmıştır. <span className="font-black text-vora-success">Resmi barkod verisidir</span> ve besin değerleri değiştirilemez.
      </p>
    </motion.div>
  );
  if (status === 'PRIVATE') return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-vora-accent/5 border border-vora-accent/10 rounded-xl flex items-start gap-3">
      <User className="w-4 h-4 text-vora-accent shrink-0 mt-0.5" />
      <p className="text-[9px] font-medium text-vora-accent/80 leading-relaxed uppercase tracking-tight">
        Bu senin <span className="font-black text-vora-accent">şahsi tarifindir</span>. Sadece senin kütüphanende görünür ve başkaları tarafından aranamaz.
      </p>
    </motion.div>
  );
  return null;
};

export function SearchAction({ onSuccess, initialMealType }: SearchActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");
  const [consumeFromInventory, setConsumeFromInventory] = useState(false);
  const [mealType, setMealType] = useState(initialMealType || "BREAKFAST");
  
  const notify = useNotificationStore();
  const { setInventory } = useAppStore();

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
    let cleaned = val.replace(/[^0-9]/g, "");
    if (cleaned.length > 1 && cleaned.startsWith("0")) {
      cleaned = cleaned.replace(/^0+/, "");
    }
    cleaned = cleaned.slice(0, 5);
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
        consumeFromInventory,
      });

      if (consumeFromInventory) {
        const invRes = await api.get("/inventory");
        setInventory(invRes.data);
      }

      notify.show("Öğün başarıyla eklendi.", "success");
      onSuccess();
    } catch (err) {
      notify.show("Kayıt sırasında bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const calc = (base: number) => Math.round((base / 100) * (Number(amount) || 0));

  return (
    <div className="flex flex-col h-[480px] justify-between pb-2">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col h-full">
            <div className="relative group shrink-0 mb-4">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-vora-tertiary group-focus-within:text-vora-accent transition-colors" />
              <input autoFocus type="text" placeholder="BESİN VEYA YEMEK ARA..." value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} className="w-full bg-white/[0.03] border border-vora-border/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-vora-accent/40 transition-all text-vora-primary font-bold tracking-widest placeholder:opacity-10 text-xs uppercase" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-2 pb-2 text-vora-primary font-bold">
              {results.length > 0 ? (
                results.map((food) => (
                  <button key={food.id} onClick={() => handleSelect(food)} className="w-full p-4 bg-white/[0.02] border border-vora-border/5 rounded-2xl flex items-center justify-between group hover:bg-vora-accent/[0.04] transition-all outline-none" >
                    <div className="flex items-center gap-4 text-left min-w-0">
                      <div className="p-3 bg-white/5 rounded-xl text-vora-tertiary group-hover:text-vora-accent transition-colors shrink-0">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-vora-primary tracking-tight truncate leading-tight uppercase">{food.name}</p>
                        <SourceTag status={food.status} />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-all shrink-0" />
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10 space-y-4">
                  <Search className="w-8 h-8" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-center text-vora-primary">Besin havuzu seni bekliyor</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col h-full space-y-3 pt-1" >
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[9px] font-black uppercase tracking-widest w-fit outline-none group mb-0.5" >
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> GERİ DÖN
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2.5rem] p-5 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-vora-accent/10 rounded-xl border border-vora-accent/10 shrink-0">
                    <Utensils className="w-5 h-5 text-vora-accent" />
                  </div>
                  <div className="min-w-0">
                    <SourceTag status={selectedFood.status} />
                    <h3 className="text-base font-black text-vora-primary tracking-tight truncate uppercase leading-tight mt-0.5">{selectedFood.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "KCAL", val: calc(selectedFood.calories), c: "text-vora-primary" },
                    { label: "PRO", val: calc(selectedFood.protein), c: "text-vora-accent" },
                    { label: "KRB", val: calc(selectedFood.carbs), c: "text-vora-primary" },
                    { label: "YAĞ", val: calc(selectedFood.fat), c: "text-vora-primary" },
                  ].map(m => (
                    <div key={m.label} className="p-2 bg-white/5 border border-white/5 rounded-xl text-center flex flex-col justify-center">
                      <p className={`text-sm font-black tracking-tighter ${m.c}`}>{m.val}</p>
                      <p className="text-[6px] font-black text-vora-tertiary uppercase tracking-tighter opacity-40">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-vora-border/10 rounded-xl">
                  <button onClick={() => handleNumericInput((Number(amount) - 10).toString())} className="p-2 hover:bg-white/10 rounded-lg text-vora-tertiary outline-none active:scale-90 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                  <div className="flex-1 text-center">
                    <input autoFocus type="text" inputMode="numeric" value={amount} onChange={(e) => handleNumericInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()} className="w-full bg-transparent text-center text-3xl font-black text-vora-primary outline-none tracking-tighter" placeholder="0" />
                    <p className="text-[6px] font-black text-vora-tertiary uppercase tracking-[0.2em] opacity-40">GRAM / ML</p>
                  </div>
                  <button onClick={() => handleNumericInput((Number(amount) + 10).toString())} className="p-2 hover:bg-white/10 rounded-lg text-vora-tertiary outline-none active:scale-90 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                </div>

                {/* Smart Inventory Toggle */}
                <button 
                  onClick={() => setConsumeFromInventory(!consumeFromInventory)}
                  className={`w-full p-3 rounded-2xl border transition-all duration-500 flex items-center justify-between group ${consumeFromInventory ? "bg-vora-accent/10 border-vora-accent/20" : "bg-white/[0.01] border-white/5"}`}
                >
                  <div className="flex items-center gap-3">
                    <Home className={`w-3.5 h-3.5 ${consumeFromInventory ? "text-vora-accent" : "text-vora-tertiary"}`} />
                    <p className={`text-[9px] font-black uppercase tracking-widest ${consumeFromInventory ? "text-vora-accent" : "text-vora-primary"}`}>Kilerimden Kullan</p>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-all ${consumeFromInventory ? "bg-vora-accent" : "bg-white/10"}`}>
                    <motion.div animate={{ x: consumeFromInventory ? 18 : 2 }} className="absolute top-0.5 left-0 w-3 h-3 bg-white rounded-full shadow-lg" />
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 px-0.5">
                {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                  <button key={t} onClick={() => setMealType(t)} className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border outline-none ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent shadow-md" : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"}`} >
                    {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-3.5 bg-vora-accent text-vora-on-accent rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[9px] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20" >
              {loading ? "İŞLENİYOR..." : "ÖĞÜNE EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
