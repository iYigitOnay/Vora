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
  <div className="flex items-center gap-1.5 text-[7px] font-black text-vora-accent tracking-[0.2em] uppercase mb-1">
    <div className="w-1.5 h-1.5 rounded-full bg-vora-accent animate-pulse" /> VORA VISION ENGINE
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
      notify.show("Fotoğraf başarıyla analiz edildi.", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Fotoğraf analiz edilemedi.";
      notify.show(msg, "error");
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
    <div className="flex flex-col h-full overflow-hidden p-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center space-y-10">
            {showScanner ? (
              <div className="relative">
                <div id="reader" className="overflow-hidden rounded-[2.5rem] border-2 border-vora-accent/20" />
                <button onClick={() => setShowScanner(false)} className="absolute -top-2 -right-2 p-3 bg-vora-surface border border-vora-border/20 rounded-full text-vora-tertiary z-10 shadow-xl"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowScanner(true)} className="w-full p-8 bg-vora-accent text-vora-on-accent rounded-[2.5rem] flex flex-col items-center gap-4 hover:brightness-110 transition-all shadow-2xl shadow-vora-accent/20 active:scale-[0.98]">
                <Camera className="w-10 h-10" />
                <div className="text-center">
                  <span className="font-black uppercase tracking-[0.4em] text-[12px]">Vizyonu Başlat</span>
                  <p className="text-[8px] opacity-40 font-bold tracking-[0.2em] mt-1">Barkod Tara veya Analiz Et</p>
                </div>
              </button>
            )}

            <div className="relative group px-2">
              <label className="block text-[10px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-4 opacity-30 group-focus-within:text-vora-accent transition-all">Manuel Barkod</label>
              <input type="text" autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="BARKOD..." className="w-full bg-transparent border-b border-vora-border/20 py-4 outline-none text-3xl font-black tracking-[0.2em] text-vora-primary placeholder:opacity-5 uppercase focus:border-vora-accent transition-all" onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()} />
              <button onClick={() => handleBarcodeSearch()} className="absolute right-2 bottom-4 text-vora-accent">{loading ? "..." : <ChevronRight className="w-8 h-8" />}</button>
            </div>

            <label className="block w-full cursor-pointer group px-2">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <div className="py-6 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl flex items-center justify-center gap-4 hover:bg-white/[0.03] transition-all hover:border-vora-accent/40">
                <Upload className="w-5 h-5 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
                <p className="text-[10px] font-black text-vora-tertiary uppercase tracking-widest group-hover:text-vora-accent transition-colors">Fotoğraf Analizi</p>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full space-y-4 pt-1">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[9px] font-black uppercase tracking-widest w-fit" >
              <ChevronLeft className="w-3.5 h-3.5" /> GERİ
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2.5rem] p-5 flex-1 flex flex-col justify-between overflow-hidden">
              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-vora-accent/10 rounded-2xl overflow-hidden border border-vora-accent/10 flex items-center justify-center shrink-0 shadow-lg">
                    {product?.image ? <img src={product.image} className="w-full h-full object-cover" /> : <UtensilsCrossed className="w-7 h-7 text-vora-accent opacity-20" />}
                  </div>
                  <div className="min-w-0">
                    <SourceTag status={product?.status} />
                    <h3 className="text-xl font-black text-vora-primary tracking-tight truncate uppercase leading-tight mt-1">{product?.name}</h3>
                    <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-40 truncate">{product?.brand || "Vora Vision"}</p>
                  </div>
                </div>

                {/* Macro Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { l: "KCAL", v: calc(product?.calories), c: "text-vora-primary" },
                    { l: "PRO", v: calc(product?.protein), c: "text-vora-accent" },
                    { l: "KRB", v: calc(product?.carbs), c: "text-vora-primary" },
                    { l: "YAĞ", v: calc(product?.fat), c: "text-vora-primary" },
                  ].map(m => (
                    <div key={m.l} className="p-3 bg-white/5 border border-white/5 rounded-xl text-center flex flex-col justify-center shadow-sm">
                      <p className={`text-base font-black tracking-tighter ${m.c}`}>{m.v}</p>
                      <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-tighter opacity-40">{m.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Inventory Toggle */}
              <div className="space-y-4">
                <button 
                  onClick={() => setConsumeFromInventory(!consumeFromInventory)}
                  className={`w-full p-4 rounded-3xl border transition-all duration-500 flex items-center justify-between group ${consumeFromInventory ? "bg-vora-accent/10 border-vora-accent/30 shadow-[0_0_20px_rgba(var(--color-accent),0.1)]" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-all ${consumeFromInventory ? "bg-vora-accent text-vora-on-accent" : "bg-white/5 text-vora-tertiary"}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${consumeFromInventory ? "text-vora-accent" : "text-vora-primary"}`}>Kilerimden Kullan</p>
                      <p className="text-[7px] font-bold text-vora-tertiary uppercase tracking-tighter opacity-50">Stok miktarını otomatik düşer</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${consumeFromInventory ? "bg-vora-accent" : "bg-white/10"}`}>
                    <motion.div animate={{ x: consumeFromInventory ? 22 : 2 }} className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-lg" />
                  </div>
                </button>

                <div className="grid grid-cols-4 gap-1.5">
                  {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                    <button key={t} onClick={() => setMealType(t as MealType)} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent" : "bg-white/[0.02] border-vora-border/10 text-vora-tertiary"}`} >
                      {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-4 bg-vora-accent text-vora-on-accent rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all shrink-0" >
              {loading ? "İŞLENİYOR..." : "ÖĞÜNÜ KAYDET"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
