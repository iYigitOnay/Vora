"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Barcode, ChevronRight, ChevronLeft, Upload, X, UtensilsCrossed, Home } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAppStore } from "@/store/useAppStore";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

interface BarcodeActionProps {
  onSuccess: () => void;
  initialMealType?: MealType;
}

const SourceTag = ({ status }: { status: any }) => (
  <div className="flex items-center gap-1.5 text-[8px] font-black text-vora-accent tracking-widest uppercase bg-vora-accent/5 px-3 py-1 rounded-full border border-vora-accent/10 w-fit">
    Vora Vision Engine
  </div>
);

export function BarcodeAction({ onSuccess, initialMealType }: BarcodeActionProps) {
  const [step, setStep] = useState(1);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");
  const [consumeFromInventory, setConsumeFromInventory] = useState(false);
  const [mealType, setMealType] = useState<MealType>(initialMealType || "BREAKFAST");
  const [showScanner, setShowScanner] = useState(false);
  const notify = useNotificationStore();
  const { setInventory } = useAppStore();

  const handleBarcodeSearch = async () => {
    if (!barcode) return;
    setLoading(true);
    try {
      const res = await api.get(`/food/barcode/${barcode}`);
      setProduct(res.data);
      setStep(2);
    } catch (err) {
      notify.show("Ürün bulunamadı.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/food/vision', formData);
      setProduct(res.data);
      setStep(2);
    } catch (err) {
      notify.show("Fotoğraf analiz edilemedi.", "error");
    } finally {
      setLoading(false);
    }
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
        foodId: product.id,
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
    <div className="flex flex-col h-full justify-between pb-6 py-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center space-y-12 text-vora-primary font-bold">
            {showScanner ? (
              <div className="relative">
                <div id="reader" className="overflow-hidden rounded-[2.5rem] border-2 border-vora-accent/20" />
                <button onClick={() => setShowScanner(false)} className="absolute -top-4 -right-4 p-3 bg-vora-surface border border-vora-border/20 rounded-full text-vora-tertiary shadow-xl z-10"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowScanner(true)} className="w-full group p-8 bg-vora-accent text-vora-on-accent rounded-[2.5rem] flex items-center justify-between hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-vora-accent/20 outline-none border-none">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-white/20 rounded-2xl"><Camera className="w-8 h-8" /></div>
                  <div className="text-left">
                    <span className="font-black uppercase tracking-[0.2em] text-[12px]">Kamerayı Başlat</span>
                    <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest mt-1.5">Vora Vision Engine</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="relative group pt-4">
              <label className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.4em] absolute -top-4 left-0 opacity-30 group-focus-within:text-vora-accent transition-colors">Barkod Numarası</label>
              <div className="flex items-end gap-6 border-b-2 border-vora-border/10 group-focus-within:border-vora-accent transition-all pb-2">
                <input type="text" autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="NUMARAYI YAZIN..." className="flex-1 bg-transparent py-4 outline-none text-2xl font-black tracking-tighter text-vora-primary placeholder:opacity-5 uppercase" onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()} />
                <button onClick={() => handleBarcodeSearch()} disabled={!barcode || loading} className={`p-4 transition-all ${barcode ? "text-vora-accent" : "text-vora-tertiary opacity-10"}`} >
                  {loading ? <div className="w-8 h-8 border-2 border-t-transparent border-vora-accent rounded-full animate-spin" /> : <ChevronRight className="w-8 h-8" />}
                </button>
              </div>
            </div>

            <label className="block w-full cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <div className="p-8 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center gap-6 hover:bg-white/[0.03] hover:border-vora-accent/30 transition-all">
                <div className="p-4 bg-white/5 rounded-full text-vora-tertiary group-hover:text-vora-accent transition-all">
                  {loading ? <div className="w-6 h-6 border-2 border-t-transparent border-vora-accent rounded-full animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <p className="text-[11px] font-black text-vora-tertiary uppercase tracking-[0.2em] group-hover:text-vora-primary transition-colors">Fotoğraf Analizi</p>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col h-full justify-center space-y-6 pt-4" >
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[10px] font-black uppercase tracking-widest w-fit mb-2 outline-none group" >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> TARAMA MODUNA DÖN
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-vora-accent/10 rounded-[1.5rem] overflow-hidden border border-vora-accent/10 flex items-center justify-center shadow-inner">
                  {product?.image ? <img src={product.image} className="w-full h-full object-cover" /> : <UtensilsCrossed className="w-10 h-10 text-vora-accent opacity-20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <SourceTag status={product?.status} />
                  <h3 className="text-xl font-black text-vora-primary tracking-tighter truncate uppercase mt-1">{product?.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "KCAL", val: calc(product?.calories) },
                  { label: "PRO", val: calc(product?.protein) },
                  { label: "KRB", val: calc(product?.carbs) },
                  { label: "YAĞ", val: calc(product?.fat) },
                ].map(m => (
                  <div key={m.label} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center">
                    <p className="text-lg font-black tracking-tighter text-vora-primary">{m.val}</p>
                    <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 border border-vora-border/10 rounded-2xl">
                <div className="flex-1 text-center">
                  <p className="text-[8px] font-black text-vora-tertiary uppercase tracking-[0.2em] mb-1">MİKTAR (G/ML)</p>
                  <input autoFocus type="text" inputMode="numeric" value={amount} onChange={(e) => handleNumericInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()} className="w-full bg-transparent text-center text-4xl font-black text-vora-primary outline-none tracking-tighter" placeholder="0" />
                </div>
              </div>

              {/* Smart Inventory Toggle */}
              <div className="bg-white/[0.02] border border-vora-border/10 rounded-2xl p-4 flex items-center justify-between group/toggle hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-all ${consumeFromInventory ? "bg-vora-accent/10 text-vora-accent" : "bg-white/5 text-vora-tertiary"}`}>
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-vora-primary uppercase tracking-widest">Kilerimden Kullan</h4>
                    <p className="text-[7px] font-bold text-vora-tertiary uppercase tracking-[0.1em] mt-0.5">Stoktan düşer</p>
                  </div>
                </div>
                <button 
                  onClick={() => setConsumeFromInventory(!consumeFromInventory)}
                  className={`w-10 h-6 rounded-full relative transition-all duration-300 ${consumeFromInventory ? "bg-vora-accent" : "bg-white/10"}`}
                >
                  <motion.div 
                    animate={{ x: consumeFromInventory ? 18 : 2 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 px-2">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                <button key={t} onClick={() => setMealType(t as MealType)} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border outline-none ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent" : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"}`} >
                  {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                </button>
              ))}
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-5 bg-vora-accent text-vora-on-accent rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-lg outline-none hover:brightness-110 active:scale-[0.98] transition-all" >
              {loading ? "İŞLENİYOR..." : "ÖĞÜNE EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
