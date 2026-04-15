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
  <div className="flex items-center gap-1 text-[6px] font-black text-vora-accent tracking-widest uppercase bg-vora-accent/5 px-2 py-0.5 rounded-full border border-vora-accent/10 w-fit">
    Vision Engine
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
    if (cleaned.length > 1 && cleaned.startsWith("0")) cleaned = cleaned.replace(/^0+/, "");
    setAmount(cleaned.slice(0, 5));
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
      notify.show("Kayıt hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const calc = (base: number) => Math.round((base / 100) * (Number(amount) || 0));

  return (
    <div className="flex flex-col h-full overflow-hidden p-2">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center space-y-6">
            {showScanner ? (
              <div className="relative">
                <div id="reader" className="overflow-hidden rounded-[2rem] border-2 border-vora-accent/20" />
                <button onClick={() => setShowScanner(false)} className="absolute -top-2 -right-2 p-2 bg-vora-surface border border-vora-border/20 rounded-full text-vora-tertiary z-10"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => setShowScanner(true)} className="w-full p-5 bg-vora-accent text-vora-on-accent rounded-3xl flex items-center justify-between hover:brightness-110 transition-all shadow-lg shadow-vora-accent/10">
                <div className="flex items-center gap-4">
                  <Camera className="w-6 h-6" />
                  <div className="text-left">
                    <span className="font-black uppercase tracking-widest text-[10px]">Vizyonu Başlat</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}

            <div className="relative group px-2">
              <input type="text" autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="BARKOD NO..." className="w-full bg-transparent border-b border-vora-border/20 py-2 outline-none text-xl font-black tracking-tighter text-vora-primary placeholder:opacity-10 uppercase focus:border-vora-accent transition-all" onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()} />
              <button onClick={() => handleBarcodeSearch()} className="absolute right-2 top-1/2 -translate-y-1/2 text-vora-accent">{loading ? "..." : <ChevronRight className="w-5 h-5" />}</button>
            </div>

            <label className="block w-full cursor-pointer group px-2">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <div className="py-4 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/[0.03] transition-all">
                <Upload className="w-4 h-4 text-vora-tertiary" />
                <p className="text-[8px] font-black text-vora-tertiary uppercase tracking-widest">Fotoğraf Yükle</p>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full space-y-3 pt-1">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-vora-tertiary hover:text-vora-primary text-[8px] font-black uppercase tracking-widest shrink-0" >
              <ChevronLeft className="w-3 h-3" /> GERİ
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2rem] p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-vora-accent/10 rounded-xl overflow-hidden border border-vora-accent/10 flex items-center justify-center shrink-0">
                  {product?.image ? <img src={product.image} className="w-full h-full object-cover" /> : <UtensilsCrossed className="w-5 h-5 text-vora-accent opacity-20" />}
                </div>
                <div className="min-w-0">
                  <SourceTag status={product?.status} />
                  <h3 className="text-[11px] font-black text-vora-primary tracking-tight truncate uppercase leading-tight">{product?.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[
                  { l: "KCAL", v: calc(product?.calories) },
                  { l: "PRO", v: calc(product?.protein) },
                  { l: "KRB", v: calc(product?.carbs) },
                  { l: "YAĞ", v: calc(product?.fat) },
                ].map(m => (
                  <div key={m.l} className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-center">
                    <p className="text-[10px] font-black tracking-tighter text-vora-primary">{m.v}</p>
                    <p className="text-[6px] font-bold text-vora-tertiary uppercase tracking-tighter">{m.l}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 px-1">
                <div className="flex-1">
                  <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-widest mb-0.5">MİKTAR (G)</p>
                  <input type="text" inputMode="numeric" value={amount} onChange={(e) => handleNumericInput(e.target.value)} className="w-full bg-transparent text-xl font-black text-vora-primary outline-none tracking-tighter" placeholder="0" />
                </div>
                <div className="bg-white/[0.02] border border-vora-border/5 rounded-xl p-2 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[7px] font-bold text-vora-primary uppercase tracking-tighter">Kiler</p>
                    <p className="text-[6px] text-vora-tertiary uppercase tracking-tighter">Düş</p>
                  </div>
                  <button onClick={() => setConsumeFromInventory(!consumeFromInventory)} className={`w-7 h-4 rounded-full relative transition-all ${consumeFromInventory ? "bg-vora-accent" : "bg-white/10"}`}>
                    <motion.div animate={{ x: consumeFromInventory ? 14 : 2 }} className="absolute top-0.5 left-0 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                <button key={t} onClick={() => setMealType(t as MealType)} className={`py-2 rounded-lg text-[7px] font-black uppercase tracking-widest border transition-all ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent" : "bg-white/[0.02] border-vora-border/10 text-vora-tertiary"}`} >
                  {t.slice(0, 3)}
                </button>
              ))}
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-3 bg-vora-accent text-vora-on-accent rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-vora-accent/10 hover:brightness-110 active:scale-[0.98] transition-all" >
              {loading ? "..." : "EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
