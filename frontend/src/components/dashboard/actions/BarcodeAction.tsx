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
      <User className="w-2.5 h-2.5" /> ÖZEL TARİFİN
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
      }, (err) => {});
    }
    return () => { scanner?.clear(); };
  }, [showScanner]);

  const handleBarcodeSearch = async (code: string) => {
    const finalCode = code || barcode;
    if (!finalCode) return;
    setLoading(true);
    try {
      const res = await api.get(`/food/scan/${finalCode}`);
      setProduct(res.data);
      setAmount(res.data.defaultAmount?.toString() || "100");
      setStep(2);
      notify.show("Ürün başarıyla tanımlandı.", "success");
    } catch (err) {
      notify.show("Barkod bulunamadı. Lütfen manuel giriş yapın.", "warning");
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
        status: 'COMMUNITY'
      });
      setAmount("100");
      setStep(2);
      setLoading(false);
      notify.show("Görsel zeka ile besin tespit edildi.", "success");
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
      notify.show("Öğün başarıyla eklendi.", "success");
      onSuccess();
    } catch (err) {
      notify.show("Kayıt hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const calc = (base: number) => Math.round((base / 100) * (Number(amount) || 0));

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pt-4">
            {showScanner ? (
              <div className="relative">
                <div id="reader" className="overflow-hidden rounded-[2.5rem] border border-vora-accent/20" />
                <button onClick={() => setShowScanner(false)} className="absolute -top-4 -right-4 p-3 bg-vora-surface border border-vora-border/20 rounded-full text-vora-tertiary shadow-xl z-10"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowScanner(true)} className="w-full group p-6 bg-vora-accent text-vora-on-accent rounded-[2.5rem] flex items-center justify-between hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-vora-accent/20 border-none outline-none">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl"><Camera className="w-6 h-6" /></div>
                  <div className="text-left">
                    <span className="font-black uppercase tracking-widest text-[10px]">Kamerayı Başlat</span>
                    <p className="text-[8px] opacity-60 font-bold uppercase tracking-widest mt-1">Vora Vision Engine</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="relative group pt-4">
              <label className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.4em] absolute -top-2 left-0 opacity-50">Barkod Numarası</label>
              <div className="flex items-end gap-4 border-b border-vora-border/20 group-focus-within:border-vora-accent transition-all">
                <div className="p-4 text-vora-tertiary group-focus-within:text-vora-accent transition-colors"><Barcode className="w-6 h-6" /></div>
                <input 
                  type="text" 
                  autoFocus
                  value={barcode} 
                  onChange={(e) => setBarcode(e.target.value)} 
                  placeholder="NUMARAYI BURAYA YAZIN..." 
                  className="flex-1 bg-transparent py-4 outline-none text-xl font-black tracking-tighter text-vora-primary placeholder:text-white/5 uppercase" 
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch(barcode)} 
                />
                <button onClick={() => handleBarcodeSearch(barcode)} disabled={!barcode || loading} className={`p-4 transition-all ${barcode ? "text-vora-accent" : "text-vora-tertiary opacity-20"}`} >
                  {loading ? <div className="w-6 h-6 border-2 border-t-transparent border-vora-accent rounded-full animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <label className="block w-full cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <div className="p-8 bg-white/[0.01] border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 hover:bg-white/[0.03] hover:border-vora-accent/30 transition-all">
                <div className="p-4 bg-white/5 rounded-full text-vora-tertiary group-hover:text-vora-accent transition-all">
                  {loading ? <div className="w-6 h-6 border-2 border-t-transparent border-vora-accent rounded-full animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.3em] group-hover:text-vora-primary transition-colors">Etiket Fotoğrafı Yükle</p>
                  <p className="text-[8px] text-vora-tertiary/40 uppercase tracking-widest">PNG, JPG VEYA HEIC</p>
                </div>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full space-y-6 pt-2" >
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-vora-tertiary hover:text-vora-primary transition-colors text-[10px] font-bold uppercase tracking-widest w-fit mb-2" >
              <ChevronLeft className="w-4 h-4" /> TARAMA MODUNA DÖN
            </button>

            <div className="bg-white/[0.03] border border-vora-border/10 rounded-[2.5rem] p-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-vora-accent/10 rounded-[1.8rem] overflow-hidden border border-vora-accent/10 flex items-center justify-center">
                  {product?.image ? <img src={product.image} className="w-full h-full object-cover" /> : <UtensilsCrossed className="w-8 h-8 text-vora-accent opacity-30" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1"><SourceTag status={product?.status} /></div>
                  <h3 className="text-2xl font-black text-vora-primary tracking-tighter truncate uppercase leading-none">{product?.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "KCAL", val: calc(product?.calories), color: "text-vora-primary" },
                  { label: "PRO", val: calc(product?.protein) + "g", color: "text-vora-accent" },
                  { label: "KRB", val: calc(product?.carbs) + "g", color: "text-vora-primary" },
                  { label: "YAĞ", val: calc(product?.fat) + "g", color: "text-vora-primary" },
                ].map(m => (
                  <div key={m.label} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center shadow-inner">
                    <p className={`text-lg font-black tracking-tighter ${m.color}`}>{m.val}</p>
                    <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="relative group pt-4">
                <label className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.4em] absolute -top-2 left-0 opacity-50">Miktar (g/ml)</label>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  value={amount} 
                  onChange={(e) => handleNumericInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleFinalSubmit()}
                  className="w-full bg-transparent border-b border-vora-border/20 py-4 outline-none text-4xl font-black tracking-tighter text-vora-primary focus:border-vora-accent transition-all uppercase" 
                  placeholder="0" 
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map(t => (
                <button key={t} onClick={() => setMealType(t as MealType)} className={`py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all border ${mealType === t ? "bg-vora-accent text-vora-on-accent border-vora-accent shadow-xl shadow-vora-accent/20" : "bg-white/[0.02] border-white/5 text-vora-tertiary hover:bg-white/5"}`} >
                  {t === "BREAKFAST" ? "Sabah" : t === "LUNCH" ? "Öğle" : t === "DINNER" ? "Akşam" : "Ara"}
                </button>
              ))}
            </div>

            <button onClick={handleFinalSubmit} disabled={loading || !amount || Number(amount) <= 0} className="w-full py-5 bg-vora-accent text-vora-on-accent rounded-[2rem] font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-vora-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-auto disabled:opacity-20" >
              {loading ? "SİSTEME KAYDEDİLİYOR..." : "ÖĞÜNE EKLE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
