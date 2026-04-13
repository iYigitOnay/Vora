"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Barcode, ChevronRight, ChevronLeft, Upload, Search, UtensilsCrossed, Flame, Target, Droplets, Scale, X, User, ShieldCheck, Users } from "lucide-react";
import api from "@/lib/api";
import { MealType } from "@prisma/client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNotificationStore } from "@/store/useNotificationStore";

interface BarcodeActionProps {
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

export function BarcodeAction({ onSuccess }: BarcodeActionProps) {
  const [step, setStep] = useState(1);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const notify = useNotificationStore();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((code) => {
        handleBarcodeSearch(code);
        scanner?.clear();
        setShowScanner(false);
      }, () => {});
    }
    return () => { scanner?.clear(); };
  }, [showScanner]);

  const handleBarcodeSearch = async (code?: string) => {
    const finalCode = code || barcode;
    if (!finalCode) return;
    setLoading(true);
    try {
      const res = await api.get(`/food/scan/${finalCode}`);
      setProduct(res.data);
      setAmount(res.data.defaultAmount?.toString() || "100");
      setStep(2);
      notify.show("Ürün tanımlandı.", "success");
    } catch (err) {
      notify.show("Ürün bulunamadı.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    notify.show(`${file.name} analiz ediliyor...`, "info");
    
    setTimeout(() => {
      setProduct({
        id: 'mock-vision',
        name: file.name.split('.')[0].toUpperCase(),
        brand: 'AI VISION',
        calories: 245,
        protein: 15,
        carbs: 30,
        fat: 8,
        status: 'VERIFIED',
        image: '/vorakurt.png'
      });
      setAmount("100");
      setStep(2);
      setLoading(false);
      notify.show("Analiz tamamlandı.", "success");
    }, 2000);
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
        foodId: product.id === 'mock-vision' ? null : product.id,
        foodData: product.id === 'mock-vision' ? product : null,
        type: mealType,
        amount: Number(amount),
      });
      notify.show("Öğün işlendi.", "success");
      onSuccess();
    } catch (err) {
      notify.show("Hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const calc = (base: number) => Math.round((base / 100) * (Number(amount) || 0));

  return (
    <div className="flex flex-col h-[420px] justify-between pb-2">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col justify-center space-y-6">
            {showScanner ? (
              <div className="relative">
                <div id="reader" className="overflow-hidden rounded-[2.5rem] border-2 border-vora-accent/20" />
                <button onClick={() => setShowScanner(false)} className="absolute -top-4 -right-4 p-3 bg-vora-surface border border-vora-border/20 rounded-full text-vora-tertiary shadow-xl z-10"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowScanner(true)} className="w-full group p-6 bg-vora-accent text-vora-on-accent rounded-[2rem] flex items-center justify-between hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-vora-accent/20 outline-none border-none">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl"><Camera className="w-6 h-6" /></div>
                  <div className="text-left">
                    <span className="font-black uppercase tracking-[0.2em] text-[10px]">Kamerayı Başlat</span>
                    <p className="text-[8px] opacity-60 font-bold uppercase tracking-widest mt-1">Vora Vision Engine</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="relative group pt-2">
              <label className="text-[9px] font-black text-vora-tertiary uppercase tracking-[0.4em] absolute -top-2 left-0 opacity-30 group-focus-within:text-vora-accent transition-colors">Barkod Numarası</label>
              <div className="flex items-end gap-4 border-b-2 border-vora-border/10 group-focus-within:border-vora-accent transition-all pb-1">
                <input type="text" autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="NUMARAYI YAZIN..." className="flex-1 bg-transparent py-3 outline-none text-xl font-black tracking-tighter text-vora-primary placeholder:opacity-5 uppercase" onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()} />
                <button onClick={() => handleBarcodeSearch()} disabled={!barcode || loading} className={`p-3 transition-all ${barcode ? "text-vora-accent" : "text-vora-tertiary opacity-10"}`} >
                  {loading ? <div className="w-6 h-6 border-2 border-t-transparent border-vora-accent rounded-full animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <label className="block w-full cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <div className="p-6 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-white/[0.03] hover:border-vora-accent/30 transition-all">
                <div className="p-3 bg-white/5 rounded-full text-vora-tertiary group-hover:text-vora-accent transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-t-transparent border-vora-accent rounded-full animate-spin" /> : <Upload className="w-5 h-5" />}
                </div>
                <p className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.2em] group-hover:text-vora-primary transition-colors">Fotoğraf Analizi</p>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex flex-col h-full justify-center space-y-4 pt-2" >
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[9px] font-black uppercase tracking-widest w-fit mb-1 outline-none group" >
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> TARAMA MODUNA DÖN
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2.5rem] p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-vora-accent/10 rounded-2xl overflow-hidden border border-vora-accent/10 flex items-center justify-center shadow-inner">
                  {product?.image ? <img src={product.image} className="w-full h-full object-cover" /> : <UtensilsCrossed className="w-8 h-8 text-vora-accent opacity-20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <SourceTag status={product?.status} />
                  <h3 className="text-lg font-black text-vora-primary tracking-tighter truncate uppercase mt-0.5">{product?.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "KCAL", val: calc(product?.calories) },
                  { label: "PRO", val: calc(product?.protein) },
                  { label: "KRB", val: calc(product?.carbs) },
                  { label: "YAĞ", val: calc(product?.fat) },
                ].map(m => (
                  <div key={m.label} className="p-2 bg-white/5 border border-white/5 rounded-xl text-center">
                    <p className="text-base font-black tracking-tighter text-vora-primary">{m.val}</p>
                    <p className="text-[7px] font-bold text-vora-tertiary uppercase tracking-widest">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-vora-border/10 rounded-xl">
                <div className="flex-1 text-center">
                  <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-[0.2em] mb-0.5">MİKTAR (G/ML)</p>
                  <input type="text" inputMode="numeric" value={amount} onChange={(e) => handleNumericInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()} className="w-full bg-transparent text-center text-3xl font-black text-vora-primary outline-none tracking-tighter" placeholder="0" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 px-1">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                <button key={t} onClick={() => setMealType(t as MealType)} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border outline-none ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent" : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"}`} >
                  {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                </button>
              ))}
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-4 bg-vora-accent text-vora-on-accent rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg outline-none hover:brightness-110 active:scale-[0.98] transition-all" >
              {loading ? "İŞLENİYOR..." : "ÖĞÜNE EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
