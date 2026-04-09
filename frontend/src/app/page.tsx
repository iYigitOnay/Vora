"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Droplets,
  Flame,
  Target,
  Trophy,
  ArrowUpRight,
  Plus,
  Sparkles,
  Search,
  Dumbbell,
  X,
  ChevronRight,
  UtensilsCrossed,
  Barcode,
  Upload,
  Camera,
  Waves,
  GlassWater,
  Milestone,
} from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Lottie from "lottie-react";
import Link from "next/link";

const BentoCard = ({ children, className, title, icon: Icon }: any) => (
  <motion.div
    className={`bg-vora-surface border border-vora-border/20 rounded-[2rem] p-6 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-vora-accent/5 rounded-xl text-vora-accent border border-vora-accent/10">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-full text-vora-tertiary">
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </motion.div>
);

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lottieData, setLottieData] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [weather, setWeather] = useState<any>(null);

  const [manualFood, setManualFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    amount: 100,
    type: "BREAKFAST",
  });

  const fetchSummary = async () => {
    try {
      const res = await api.get("/dashboard/summary");
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/moody-wolf.json")
      .then((res) => res.json())
      .then((d) => setLottieData(d));
    fetchSummary();
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current_weather=true",
    )
      .then((res) => res.json())
      .then((d) => setWeather(d.current_weather));
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      await api.post("/meal/log-water", { amount });
      setShowWaterModal(false);
      fetchSummary();
    } catch (err) {
      console.error("Su eklenemedi:", err);
    }
  };

  const handleManualSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const foodRes = await api.post("/food/manual", {
        name: manualFood.name,
        calories: Number(manualFood.calories),
        protein: Number(manualFood.protein),
        carbs: Number(manualFood.carbs),
        fat: Number(manualFood.fat),
      });
      await api.post("/meal/log", {
        foodId: foodRes.data.id,
        type: manualFood.type,
        amount: Number(manualFood.amount),
      });
      setShowManualModal(false);
      setManualFood({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        amount: 100,
        type: "BREAKFAST",
      });
      fetchSummary();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-32 h-32 mb-6 opacity-50">
          {lottieData && <Lottie animationData={lottieData} loop={true} />}
        </div>
        <p className="text-vora-accent font-bold tracking-[0.4em] text-[10px] animate-pulse uppercase">
          Veriler Analiz Ediliyor...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { user, targets, consumed, auraStreak } = data;
  const remainingCals = Math.max(targets.calories - consumed.calories, 0);
  const remainingWater = Math.max(targets.water - consumed.water, 0);
  const strokeValue = Math.min(
    (consumed.calories / targets.calories) * 1000,
    1000,
  );

  const macros = [
    { label: "Karbonhidrat", val: consumed.carbs, target: targets.carbs },
    { label: "Protein", val: consumed.protein, target: targets.protein },
    { label: "Yağ", val: consumed.fat, target: targets.fat },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-extralight tracking-tight uppercase">
            Selam <span className="font-bold">{user.firstName}</span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-vora-tertiary text-[10px] tracking-[0.3em] uppercase opacity-60 font-bold italic">
              Bugünkü aura dengen mükemmel
            </p>
            {weather && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                <span className="text-[9px] font-bold text-vora-accent">
                  {weather.temperature}°C
                </span>
                <span className="text-[8px] text-vora-tertiary uppercase tracking-tighter">
                  İstanbul
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-widest">
              Aura Streak
            </p>
            <p className="text-2xl font-bold text-vora-accent tracking-tighter">
              {auraStreak} Gün
            </p>
          </div>
          <div className="w-12 h-12 bg-vora-accent/10 rounded-full flex items-center justify-center border border-vora-accent/20 text-vora-accent shadow-[0_0_20px_rgba(var(--color-accent),0.1)]">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 mb-6">
        {/* Enerji Dengesi */}
        <BentoCard
          title="Enerji Dengesi"
          icon={Zap}
          className="md:col-span-8 md:row-span-2"
        >
          <div className="flex flex-col md:flex-row items-center justify-around h-full">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-white/5 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  initial={{ strokeDasharray: "0 1000" }}
                  animate={{
                    strokeDasharray: `${(strokeValue / 1000) * 280} 1000`,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-vora-accent fill-none"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-5xl font-black tracking-tighter mb-1">
                  {remainingCals}
                </p>
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">
                  Kcal Kaldı
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full max-w-[320px]">
              <div>
                <p className="text-[9px] font-bold text-vora-tertiary uppercase mb-1 opacity-50">
                  Günlük Hedef
                </p>
                <p className="text-xl font-bold">
                  {targets.calories}{" "}
                  <span className="text-[10px] text-vora-tertiary font-normal">
                    kcal
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-vora-tertiary uppercase mb-1 opacity-50">
                  Toplam Alınan
                </p>
                <p className="text-xl font-bold">
                  {consumed.calories}{" "}
                  <span className="text-[10px] text-vora-tertiary font-normal">
                    kcal
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-vora-tertiary uppercase mb-1 opacity-50">
                  Kalan Su
                </p>
                <p className="text-xl font-bold text-vora-accent">
                  {remainingWater > 0 ? (remainingWater / 1000).toFixed(1) : 0}{" "}
                  <span className="text-[10px] text-vora-tertiary font-normal">
                    Litre
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-vora-tertiary uppercase mb-1 opacity-50">
                  Aura Durumu
                </p>
                <p className="text-xl font-bold text-vora-accent">Stabil</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Hızlı İşlemler */}
        <BentoCard
          title="Hızlı İşlemler"
          icon={Plus}
          className="md:col-span-4 md:row-span-2"
        >
          <div className="flex flex-col gap-2.5 h-full justify-center">
            <Link href="/diary" className="flex-1">
              <button className="w-full h-full p-3.5 bg-white/[0.02] hover:bg-vora-accent/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Yemek Ara
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
              </button>
            </Link>
            <Link href="/diary?action=scan" className="flex-1">
              <button className="w-full h-full p-3.5 bg-white/[0.02] hover:bg-vora-accent/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl"><Barcode className="w-4 h-4" /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Barkod'la Ekle</span>
                </div>
                <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
              </button>
            </Link>

            <button
              onClick={() => setShowManualModal(true)}
              className="flex-1 p-3.5 bg-white/[0.02] hover:bg-vora-secondary/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vora-secondary/10 text-vora-secondary rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Manuel Ekle
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-secondary transition-colors" />
            </button>
            <button
              onClick={() => setShowWaterModal(true)}
              className="flex-1 p-3.5 bg-white/[0.02] hover:bg-vora-warning/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vora-warning/10 text-vora-warning rounded-xl">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Su İçtim
                </span>
              </div>
              <Plus className="w-4 h-4 text-vora-tertiary group-hover:text-vora-warning transition-colors" />
            </button>
          </div>
        </BentoCard>

        {/* Makro Dengesi */}
        <BentoCard
          title="Makro Dengesi"
          icon={Target}
          className="md:col-span-6 md:row-span-1"
        >
          <div className="space-y-5 pt-2">
            {macros.map((m) => {
              const pct = Math.min((m.val / m.target) * 100, 100) || 0;
              return (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest">
                      {m.label}
                    </span>
                    <span className="text-[11px] font-bold">
                      {m.val}g{" "}
                      <span className="text-[8px] text-vora-tertiary font-normal">
                        / {m.target}g
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full bg-vora-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* Hidrasyon */}
        <BentoCard
          title="Hidrasyon"
          icon={Droplets}
          className="md:col-span-6 md:row-span-1"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="flex items-center gap-10">
              <div className="text-center">
                <p className="text-4xl font-black tracking-tighter">
                  {(consumed.water / 1000).toFixed(1)}
                </p>
                <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-widest">
                  Litre
                </p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
                  const isFilled = (consumed.water / targets.water) * 12 >= i;
                  return (
                    <div
                      key={i}
                      className={`w-2.5 h-10 rounded-full transition-all ${isFilled ? "bg-vora-accent shadow-[0_0_15px_rgba(var(--color-accent),0.4)]" : "bg-white/5"}`}
                    />
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => setShowWaterModal(true)}
              className="p-5 bg-vora-accent rounded-2xl text-vora-on-accent shadow-xl shadow-vora-accent/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </BentoCard>
      </div>

      {/* MODALLAR */}
      <AnimatePresence>
        {/* Su Seçim Modalı */}
        {showWaterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWaterModal(false)}
            className="fixed inset-0 z-[100] bg-vora-background/95 flex items-center justify-center p-6 backdrop-blur-sm cursor-pointer"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-vora-surface border border-vora-border/20 rounded-[3rem] p-10 relative shadow-2xl cursor-default"
            >
              <button
                onClick={() => setShowWaterModal(false)}
                className="absolute top-8 right-8 text-vora-tertiary hover:text-vora-accent transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-light tracking-widest uppercase mb-8">
                Hidrasyon Kaydı
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: "Bardak", v: 200, i: GlassWater },
                  { l: "K. Şişe", v: 330, i: Droplets },
                  { l: "Orta Şişe", v: 500, i: Waves },
                  { l: "Büyük Şişe", v: 1500, i: Milestone },
                ].map((opt) => (
                  <button
                    key={opt.l}
                    onClick={() => handleAddWater(opt.v)}
                    className="p-6 bg-white/[0.02] hover:bg-vora-accent/5 border border-white/10 rounded-3xl flex flex-col items-center gap-3 transition-all group"
                  >
                    <opt.i className="w-6 h-6 text-vora-accent opacity-40 group-hover:opacity-100" />
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        {opt.l}
                      </p>
                      <p className="text-[8px] text-vora-tertiary uppercase">
                        {opt.v >= 1000
                          ? (opt.v / 1000).toFixed(1) + "L"
                          : opt.v + "ml"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Vision (Barkod) Test Modalı */}
        {showVisionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVisionModal(false)}
            className="fixed inset-0 z-[100] bg-vora-background/98 flex items-center justify-center p-6 cursor-pointer"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-vora-surface border border-vora-border/20 rounded-[3rem] p-12 relative shadow-2xl text-center overflow-hidden cursor-default"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-vora-accent/20 animate-pulse" />
              <button
                onClick={() => setShowVisionModal(false)}
                className="absolute top-8 right-8 text-vora-tertiary hover:text-vora-accent transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10 inline-block p-8 rounded-[2.5rem] bg-vora-accent/[0.03] border border-vora-accent/20 relative group">
                <Barcode className="w-16 h-16 text-vora-accent shadow-[0_0_30px_rgba(var(--color-accent),0.4)]" />
                <div className="absolute inset-0 border-2 border-vora-accent/20 rounded-[2.5rem] animate-ping opacity-20" />
              </div>

              <h2 className="text-3xl font-light tracking-[0.3em] uppercase mb-4 text-vora-primary">
                Vora <span className="font-bold text-vora-accent">Vision</span>
              </h2>
              <p className="text-[10px] text-vora-tertiary uppercase tracking-widest mb-12 font-bold opacity-60">
                Ürün barkodunu tarayarak saniyeler içinde kaydet.
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
                <Link href="/diary">
                  <button className="w-full py-6 bg-vora-accent text-vora-on-accent rounded-[2rem] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-vora-accent/20 hover:brightness-110 active:scale-95 transition-all">
                    <Camera className="w-5 h-5" /> Kamerayı Başlat
                  </button>
                </Link>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-vora-border/20" />
                  <span className="text-[8px] font-bold text-vora-tertiary uppercase">
                    veya
                  </span>
                  <div className="h-[1px] flex-1 bg-vora-border/20" />
                </div>
                <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
                  <input 
                    type="text" 
                    placeholder="Barkod No Gir" 
                    className="flex-1 bg-transparent text-[10px] font-bold px-4 outline-none uppercase tracking-widest text-white"
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter') {
                        const barcode = e.target.value;
                        if (barcode) window.location.href = `/diary?scan=${barcode}`;
                      }
                    }}
                  />
                  <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Manuel Ekle Modalı */}
        {showManualModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => setShowManualModal(false)}
            className="fixed inset-0 z-[100] bg-vora-background/95 flex items-center justify-center p-6 backdrop-blur-sm cursor-pointer"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-vora-surface border border-vora-border/20 rounded-[3rem] p-10 relative shadow-2xl cursor-default"
            >
              <button onClick={() => setShowManualModal(false)} className="absolute top-8 right-8 p-3 text-vora-tertiary hover:text-vora-primary transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-light tracking-widest uppercase mb-10">Manuel Kayıt</h2>
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-vora-tertiary mb-2 uppercase tracking-widest opacity-60">Yiyecek İsmi</label>
                    <input type="text" required placeholder="Örn: Ev Yapımı Çorba" className="w-full bg-white/5 border border-vora-border/20 rounded-2xl p-4 focus:border-vora-accent outline-none text-white" value={manualFood.name} onChange={e => setManualFood({...manualFood, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-vora-tertiary mb-2 uppercase tracking-widest opacity-60">Kalori</label>
                    <input type="number" required className="w-full bg-white/5 border border-vora-border/20 rounded-2xl p-4 focus:border-vora-accent outline-none text-white" value={manualFood.calories} onChange={e => setManualFood({...manualFood, calories: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-vora-tertiary mb-2 uppercase tracking-widest opacity-60">Protein (g)</label>
                    <input type="number" required className="w-full bg-white/5 border border-vora-border/20 rounded-2xl p-4 focus:border-vora-accent outline-none text-white" value={manualFood.protein} onChange={e => setManualFood({...manualFood, protein: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-vora-tertiary mb-2 uppercase tracking-widest opacity-60">Karbonhidrat (g)</label>
                    <input type="number" required className="w-full bg-white/5 border border-vora-border/20 rounded-2xl p-4 focus:border-vora-accent outline-none text-white" value={manualFood.carbs} onChange={e => setManualFood({...manualFood, carbs: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-vora-tertiary mb-2 uppercase tracking-widest opacity-60">Yağ (g)</label>
                    <input type="number" required className="w-full bg-white/5 border border-vora-border/20 rounded-2xl p-4 focus:border-vora-accent outline-none text-white" value={manualFood.fat} onChange={e => setManualFood({...manualFood, fat: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-4 pt-6"><button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-5 text-[10px] font-bold uppercase tracking-widest text-vora-tertiary">Vazgeç</button><button type="submit" className="flex-[2] bg-vora-accent text-vora-on-accent py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-vora-accent/20">Sisteme Kaydet</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-6 text-center opacity-30">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Sustainable Health Architecture
        </p>
      </footer>
    </div>
  );
}
