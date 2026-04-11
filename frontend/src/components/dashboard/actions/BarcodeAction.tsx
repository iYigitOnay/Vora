"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Barcode, ChevronRight, ChevronLeft, Upload, Search, Flame, Target, Droplets, Scale } from "lucide-react";
import api from "@/lib/api";
import { MealType } from "@prisma/client";

interface BarcodeActionProps {
  onSuccess: () => void;
}

export function BarcodeAction({ onSuccess }: BarcodeActionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({
    amount: 100,
    type: "BREAKFAST" as MealType,
    customName: "",
  });

  const handleBarcodeSearch = async (code: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/food/scan/${code || barcode}`);
      setProduct(res.data);
      setForm({ ...form, customName: res.data.name });
      setStep(3);
    } catch (err) {
      alert("Ürün bulunamadı. Lütfen manuel ekleyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/meal/log", {
        foodId: product.id,
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
          <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
            <button className="w-full group p-6 bg-vora-accent text-vora-on-accent rounded-[2rem] flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-vora-accent/20">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/20 rounded-2xl"><Camera className="w-6 h-6" /></div>
                <span className="font-bold uppercase tracking-widest text-xs text-left leading-tight">Kamerayı Başlat<br/><span className="text-[8px] opacity-60 font-medium">Hızlı Tarama</span></span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="w-full p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] focus-within:border-vora-accent/40 transition-all">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-vora-tertiary/10 text-vora-tertiary rounded-2xl group-focus-within:text-vora-accent transition-colors"><Barcode className="w-6 h-6" /></div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    autoFocus
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="BARKOD NUMARASI..." 
                    className="w-full bg-transparent text-sm font-bold outline-none uppercase tracking-widest text-vora-primary placeholder:opacity-20"
                    onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch(barcode)}
                  />
                </div>
                <button 
                  onClick={() => handleBarcodeSearch(barcode)}
                  disabled={!barcode || loading}
                  className={`p-2 rounded-xl transition-all ${barcode ? "bg-vora-accent text-white" : "text-vora-tertiary opacity-20"}`}
                >
                  {loading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 group cursor-pointer hover:bg-white/[0.03] transition-all">
              <div className="p-3 bg-white/5 rounded-full text-vora-tertiary group-hover:text-vora-primary"><Upload className="w-5 h-5" /></div>
              <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">Etiket Fotoğrafı Yükle</p>
            </div>
          </motion.div>
        )}

        {step === 3 && product && (
          <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
            <div className="p-5 bg-vora-accent/5 border border-vora-accent/20 rounded-[2rem] flex items-center gap-4">
              <div className="w-16 h-16 bg-vora-surface rounded-2xl overflow-hidden border border-white/5">
                {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <UtensilsCrossed className="w-full h-full p-4 text-vora-tertiary opacity-20" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[7px] font-bold text-vora-accent uppercase tracking-[0.3em] mb-1">{product.brand || "BİLİNMEYEN MARKA"}</p>
                <input 
                  value={form.customName}
                  onChange={(e) => setForm({...form, customName: e.target.value})}
                  className="w-full bg-transparent text-sm font-black text-vora-primary outline-none tracking-tight leading-none truncate"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "KCAL", val: product.calories, color: "text-vora-accent" },
                { label: "PRO", val: product.protein, color: "text-vora-secondary" },
                { label: "KRB", val: product.carbs, color: "text-vora-warning" },
                { label: "YAĞ", val: product.fat, color: "text-vora-error" },
              ].map(m => (
                <div key={m.label} className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                  <p className={`text-[9px] font-black ${m.color}`}>{m.val}</p>
                  <p className="text-[6px] font-bold text-vora-tertiary uppercase tracking-tighter">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-[1.5rem] flex items-center justify-between">
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

      {step === 3 && (
        <button 
          onClick={() => setStep(1)}
          className="absolute top-0 left-0 p-2 text-vora-tertiary hover:text-vora-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
