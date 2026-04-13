"use client";

import { motion } from "framer-motion";
import { Zap, Plus, Search, ChevronRight, Barcode, Target, Droplets } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import Lottie from "lottie-react";
import { QuickActionsManager, ActionType } from "@/components/dashboard/QuickActionsManager";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { EnergyBalance } from "@/components/dashboard/cards/EnergyBalance";
import { MacroBalance } from "@/components/dashboard/cards/MacroBalance";
import { HydrationStatus } from "@/components/dashboard/cards/HydrationStatus";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";

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
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </motion.div>
);

export default function HomePage() {
  const { user, dashboard, loading, setUser, setDashboard, setLoading } = useAppStore();
  const { theme, setTheme } = useThemeStore();
  const [lottieData, setLottieData] = useState(null);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [weather, setWeather] = useState<any>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/summary");
      
      // Global Store Update
      setUser(res.data.user);
      setDashboard(res.data);
      
      // Persona Sync (Senior approach)
      if (res.data.user.persona && res.data.user.persona !== theme) {
        setTheme(res.data.user.persona);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setLoading(false);
    }
  }, [setUser, setDashboard, setLoading, setTheme, theme]);

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
  }, [fetchSummary]);

  if (loading && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-32 h-32 mb-6 opacity-50">
          {lottieData && <Lottie animationData={lottieData} loop={true} />}
        </div>
        <p className="text-vora-accent font-bold tracking-[0.4em] text-[10px] animate-pulse uppercase text-center">
          Vora AI Verileri Analiz Ediyor...
        </p>
      </div>
    );
  }

  if (!dashboard || !user) return null;

  const { targets, consumed, auraStreak } = dashboard;
  const macros = [
    { label: "Karbonhidrat", val: consumed.carbs, target: targets.carbs },
    { label: "Protein", val: consumed.protein, target: targets.protein },
    { label: "Yağ", val: consumed.fat, target: targets.fat },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader user={user} auraStreak={auraStreak} weather={weather} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 mb-6">
        <BentoCard title="Enerji Dengesi" icon={Zap} className="md:col-span-8 md:row-span-2">
          <EnergyBalance targets={targets} consumed={consumed} />
        </BentoCard>

        <BentoCard title="Hızlı İşlemler" icon={Plus} className="md:col-span-4 md:row-span-2">
          <div className="flex flex-col gap-2.5 h-full justify-center">
            <button onClick={() => setActiveAction("search")} className="flex-1 p-3.5 bg-white/[0.02] hover:bg-vora-accent/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl"><Search className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-vora-primary">Besin Ara</span>
              </div>
              <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
            </button>
            <button onClick={() => setActiveAction("barcode")} className="flex-1 p-3.5 bg-white/[0.02] hover:bg-vora-accent/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all text-left text-vora-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl"><Barcode className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Barkod Tarama</span>
              </div>
              <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
            </button>
            <button onClick={() => setActiveAction("manual")} className="flex-1 p-3.5 bg-white/[0.02] hover:bg-vora-accent/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all text-left text-vora-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl"><Plus className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Manuel Giriş</span>
              </div>
              <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
            </button>
            <button onClick={() => setActiveAction("water")} className="flex-1 p-3.5 bg-white/[0.02] hover:bg-vora-accent/[0.03] border border-vora-border/20 rounded-2xl flex items-center justify-between group transition-all text-left text-vora-primary">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl"><Droplets className="w-4 h-4" /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Su Ekle</span>
              </div>
              <ChevronRight className="w-4 h-4 text-vora-tertiary group-hover:text-vora-accent transition-colors" />
            </button>
          </div>
        </BentoCard>

        <BentoCard title="Makro Dengesi" icon={Target} className="md:col-span-6 md:row-span-1">
          <MacroBalance macros={macros} />
        </BentoCard>

        <BentoCard title="Hidrasyon" icon={Droplets} className="md:col-span-6 md:row-span-1">
          <HydrationStatus consumed={consumed} targets={targets} onAddClick={() => setActiveAction("water")} />
        </BentoCard>
      </div>

      <QuickActionsManager activeAction={activeAction} onClose={() => setActiveAction(null)} onRefresh={fetchSummary} />

      <footer className="mt-6 text-center opacity-30 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Sustainable Health Architecture
        </p>
      </footer>
    </div>
  );
}
