"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Barcode,
  Search,
  X,
  UtensilsCrossed,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  Trash2,
  Camera,
  Flame,
  Upload
  } from "lucide-react";

import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/api";

const DiaryCard = ({
  children,
  title,
  subtitle,
  icon: Icon,
  colorClass = "text-vora-accent",
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-vora-surface border border-vora-border/20 rounded-[2rem] p-6 hover:border-vora-border/40 transition-all group shadow-xl"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-white/5 rounded-2xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase">
            {title}
          </h3>
          <p className="text-[10px] text-vora-tertiary uppercase tracking-tight">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="p-2 hover:bg-white/5 rounded-full text-vora-tertiary opacity-0 group-hover:opacity-100 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="space-y-3">{children}</div>
  </motion.div>
);

import { useSearchParams } from 'next/navigation';

export default function DiaryPage() {
  const searchParams = useSearchParams();
  const [showScanner, setShowScanner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [amount, setAmount] = useState<string>("100");
  const [addToLibrary, setAddToLibrary] = useState(false);
  const [mealType, setMealType] = useState<string>("BREAKFAST");
  const [dailyMeals, setDailyLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // URL'den barkod yakalama
  useEffect(() => {
    const scanQuery = searchParams.get("scan");
    if (scanQuery) {
      onScanSuccess(scanQuery);
    }

    const actionQuery = searchParams.get("action");
    if (actionQuery === "scan") {
      setShowScanner(true);
    }
  }, [searchParams]);



  // Günlük kayıtları çek
  const fetchLogs = async () => {
    try {
      const res = await api.get(`/meal/daily?date=${new Date().toISOString()}`);
      setDailyLogs(res.data);
    } catch (err) {
      console.error("Kayıtlar çekilemedi:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Yemek Ara
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const res = await api.get(`/food/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error("Arama hatası:", err);
        }
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Barkod Okunduğunda
  const onScanSuccess = async (result: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/food/scan/${result}`);
      setSelectedFood(res.data);
      setShowScanner(false);
      setShowSearch(true);
    } catch (err) {
      console.error("Ürün bulunamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false,
      );
      scanner.render(onScanSuccess, (err) => {
        // Tarama hataları NotFoundException (sessiz geçilir)
      });
      return () => {
        scanner.clear();
      };
    }
  }, [showScanner]);

  const handleLogMeal = async () => {
    if (!selectedFood) return;
    setLoading(true);
    try {
      await api.post("/meal/log", {
        foodId: selectedFood.id,
        type: mealType,
        amount: Number(amount),
      });
      setShowSearch(false);
      setSelectedFood(null);
      fetchLogs();
    } catch (err) {
      console.error("Kaydedilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/meal/item/${id}`);
      fetchLogs();
    } catch (err) {
      console.error("Silinemedi:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-extralight tracking-tight mb-2 uppercase">
            GÜNLÜK{" "}
            <span className="font-bold text-vora-accent tracking-tighter italic">
              LOG
            </span>
          </h1>
          <p className="text-vora-tertiary text-sm tracking-widest uppercase opacity-60">
            Beslenme ve hidrasyon takibi
          </p>
        </div>

        <div className="flex items-center gap-6 bg-vora-surface border border-vora-border/20 p-2 rounded-2xl shadow-lg">
          <button className="p-2 hover:bg-white/5 rounded-xl text-vora-tertiary transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center px-4">
            <p className="text-xs font-bold tracking-widest uppercase">Bugün</p>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-xl text-vora-tertiary transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Control Center */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-vora-surface border border-vora-accent/20 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
            <h2 className="text-xs font-bold text-vora-accent tracking-[0.3em] uppercase">
              Vora Vision Center
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setShowScanner(true)}
                className="w-full p-6 bg-vora-accent text-vora-on-accent rounded-3xl flex items-center justify-between group overflow-hidden relative shadow-xl shadow-vora-accent/10 hover:brightness-110 transition-all"
              >
                <div className="z-10 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                    Hızlı Tarama
                  </p>
                  <p className="text-lg font-bold tracking-tight">
                    Barkod Okut
                  </p>
                </div>
                <Barcode className="w-12 h-12 opacity-20 group-hover:scale-110 transition-transform z-10" />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="w-full p-6 bg-white/5 border border-vora-border/20 rounded-3xl flex items-center justify-between group hover:border-vora-accent/40 transition-all"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-vora-tertiary mb-1">
                    Kütüphaneden
                  </p>
                  <p className="text-lg font-bold tracking-tight">Yemek Ara</p>
                </div>
                <Search className="w-8 h-8 text-vora-accent opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {[
            { id: "BREAKFAST", l: "Kahvaltı", i: Clock, c: "text-vora-accent" },
            {
              id: "LUNCH",
              l: "Öğle Yemeği",
              i: UtensilsCrossed,
              c: "text-vora-secondary",
            },
            { id: "DINNER", l: "Akşam Yemeği", i: Flame, c: "text-vora-error" },
            { id: "SNACK", l: "Atıştırmalık", i: Zap, c: "text-vora-warning" },
          ].map((m) => {
            const mealData = dailyMeals.find((dm) => dm.type === m.id);
            return (
              <DiaryCard
                key={m.id}
                title={m.l}
                subtitle={m.id}
                icon={m.i}
                colorClass={m.c}
              >
                {mealData && mealData.items.length > 0 ? (
                  mealData.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-vora-border/20 group/item transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-vora-accent/5 flex items-center justify-center text-vora-accent font-bold text-xs italic">
                          {item.food.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-tight">
                            {item.food.name}
                          </p>
                          <p className="text-[9px] text-vora-tertiary uppercase">
                            {item.amount}g •{" "}
                            {Math.round(
                              (item.food.calories / 100) * item.amount,
                            )}{" "}
                            kcal
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover/item:opacity-100 p-2 text-vora-error/40 hover:text-vora-error transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-20 flex items-center justify-center border-2 border-dashed border-vora-border/20 rounded-2xl opacity-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-vora-tertiary">
                      Henüz Kayıt Yok
                    </p>
                  </div>
                )}
              </DiaryCard>
            );
          })}
        </div>
      </div>

      {/* SEARCH & LOG MODAL */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-vora-background/95 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-xl bg-vora-surface border border-white/10 rounded-[3rem] p-10 relative shadow-2xl">
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSelectedFood(null);
                }}
                className="absolute top-8 right-8 p-3 text-vora-tertiary hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {!selectedFood ? (
                <div className="space-y-8">
                  <h2 className="text-2xl font-light tracking-widest uppercase">
                    Yemek Ara
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vora-tertiary" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Örn: Haşlanmış Yumurta"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:border-vora-accent outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {searchResults.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFood(f)}
                        className="w-full p-4 bg-white/[0.02] hover:bg-vora-accent/5 rounded-xl border border-vora-border/20 text-left flex justify-between items-center group transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold uppercase tracking-tight">
                            {f.name}
                          </p>
                          <p className="text-[10px] text-vora-tertiary uppercase">
                            {f.brand || "Vora Kütüphane"}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-vora-accent/10 rounded-[2rem] flex items-center justify-center text-vora-accent border border-vora-accent/20">
                      <UtensilsCrossed className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold uppercase tracking-tight text-vora-primary">
                        {selectedFood.name}
                      </h2>
                      <p className="text-xs text-vora-text-secondary uppercase tracking-widest font-medium">
                        {selectedFood.brand || "Vora Kütüphane"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-vora-text-secondary uppercase tracking-[0.2em] ml-1">
                        Miktar (Gram / ml)
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="0"
                          className="w-full bg-vora-surface-raised border border-vora-border rounded-2xl p-4 text-2xl font-black outline-none focus:border-vora-accent text-vora-primary transition-all shadow-inner"
                          value={amount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setAmount(val === "" ? "" : parseInt(val, 10).toString());
                          }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-vora-text-tertiary uppercase tracking-widest group-focus-within:text-vora-accent transition-colors">G / ML</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-vora-text-secondary uppercase tracking-[0.2em] ml-1">
                        Öğün Tipi
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-vora-surface-raised border border-vora-border rounded-2xl p-4 h-[66px] outline-none focus:border-vora-accent uppercase text-[10px] font-bold tracking-widest text-vora-primary appearance-none cursor-pointer transition-all shadow-inner"
                          value={mealType}
                          onChange={(e) => setMealType(e.target.value)}
                        >
                          <option value="BREAKFAST">Kahvaltı</option>
                          <option value="LUNCH">Öğle Yemeği</option>
                          <option value="DINNER">Akşam Yemeği</option>
                          <option value="SNACK">Atıştırmalık</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vora-text-tertiary rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Kütüphaneye Ekleme Switch'i — Temalar.md uyumlu */}
                  <div 
                    className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer ${addToLibrary ? "bg-vora-accent/5 border-vora-accent/30 shadow-[0_0_20px_rgba(var(--color-accent),0.05)]" : "bg-vora-surface-raised border-vora-border/40 hover:border-vora-border"}`} 
                    onClick={() => setAddToLibrary(!addToLibrary)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${addToLibrary ? "bg-vora-accent text-vora-text-on-accent scale-110 shadow-lg shadow-vora-accent/20" : "bg-vora-background text-vora-text-tertiary"}`}>
                        <Plus className={`w-6 h-6 transition-transform duration-500 ${addToLibrary ? "rotate-90" : ""}`} />
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${addToLibrary ? "text-vora-primary" : "text-vora-text-secondary opacity-60"}`}>Kütüphaneme Ekle</p>
                        <p className="text-[9px] text-vora-text-tertiary uppercase font-medium">Bu besini favorilerine dahil et</p>
                      </div>
                    </div>
                    <div className={`w-14 h-7 rounded-full p-1 transition-all duration-500 relative ${addToLibrary ? "bg-vora-accent" : "bg-vora-background border border-vora-border"}`}>
                      <motion.div 
                        animate={{ x: addToLibrary ? 28 : 0 }}
                        className="w-5 h-5 bg-white rounded-full shadow-xl z-10 relative"
                      />
                      <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${addToLibrary ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-vora-accent to-vora-accent-bright animate-pulse`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 p-6 bg-vora-surface-raised rounded-3xl border border-vora-border text-center shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[8px] text-vora-text-secondary uppercase tracking-[0.2em] font-bold">Kcal</p>
                      <p className="font-black text-lg text-vora-primary tracking-tighter">
                        {Math.round((selectedFood.calories / 100) * (Number(amount) || 0))}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-vora-text-secondary uppercase tracking-[0.2em] font-bold">Prot</p>
                      <p className="font-black text-lg text-vora-primary tracking-tighter">
                        {Math.round((selectedFood.protein / 100) * (Number(amount) || 0))}g
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-vora-text-secondary uppercase tracking-[0.2em] font-bold">Karb</p>
                      <p className="font-black text-lg text-vora-primary tracking-tighter">
                        {Math.round((selectedFood.carbs / 100) * (Number(amount) || 0))}g
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-vora-text-secondary uppercase tracking-[0.2em] font-bold">Yağ</p>
                      <p className="font-black text-lg text-vora-primary tracking-tighter">
                        {Math.round((selectedFood.fat / 100) * (Number(amount) || 0))}g
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="flex-1 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-vora-text-tertiary hover:text-vora-primary transition-all active:scale-95"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleLogMeal}
                      disabled={loading || !amount || Number(amount) <= 0}
                      className="flex-[2.5] bg-vora-accent text-vora-text-on-accent py-5 rounded-[1.5rem] font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-vora-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 disabled:grayscale transition-all"
                    >
                      Sisteme İşle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Overlay (Vora Vision) */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-vora-background/98 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <div className="w-full max-w-xl bg-vora-surface border border-vora-border/20 rounded-[3rem] p-12 relative shadow-2xl text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-vora-accent/20 animate-pulse" />
              <button onClick={() => setShowScanner(false)} className="absolute top-8 right-8 text-vora-tertiary hover:text-vora-accent transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-10 inline-block p-8 rounded-[2.5rem] bg-vora-accent/[0.03] border border-vora-accent/20 relative group">
                <Barcode className="w-16 h-16 text-vora-accent shadow-[0_0_30px_rgba(var(--color-accent),0.4)]" />
                <div className="absolute inset-0 border-2 border-vora-accent/20 rounded-[2.5rem] animate-ping opacity-20" />
              </div>
              
              <h2 className="text-3xl font-light tracking-[0.3em] uppercase mb-4 text-vora-primary">Vora <span className="font-bold text-vora-accent">Vision</span></h2>
              <p className="text-[10px] text-vora-tertiary uppercase tracking-widest mb-12 font-bold opacity-60">Ürün barkodunu tarayarak saniyeler içinde kaydet.</p>
              
              <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
                <div id="reader" className="hidden" /> {/* Arka planda çalışacak motor */}
                
                <button 
                  onClick={() => {
                    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
                    document.getElementById('reader')?.classList.remove('hidden');
                    scanner.render(onScanSuccess, (err) => {});
                  }}
                  className="w-full py-6 bg-vora-accent text-vora-on-accent rounded-[2rem] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-vora-accent/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" /> Kamerayı Başlat
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-vora-border/20" />
                  <span className="text-[8px] font-bold text-vora-tertiary uppercase">veya</span>
                  <div className="h-[1px] flex-1 bg-vora-border/20" />
                </div>

                <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-vora-border/20">
                  <input 
                    type="text" 
                    placeholder="Barkod No Gir" 
                    className="flex-1 bg-transparent text-[10px] font-bold px-4 outline-none uppercase tracking-widest text-white"
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter') onScanSuccess(e.target.value);
                    }}
                  />
                  <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <button className="w-full py-5 bg-white/[0.02] border border-white/10 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/[0.05] transition-all mt-2">
                  <Upload className="w-4 h-4" /> Barkod Fotoğrafı Yükle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
