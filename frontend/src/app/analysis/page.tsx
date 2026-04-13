"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Calendar, BarChart3, ArrowUpRight, Zap } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";

const BentoCard = ({ children, className, title, icon: Icon }: any) => (
  <motion.div
    className={`bg-vora-surface border border-vora-border/20 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-vora-accent/5 rounded-2xl text-vora-accent border border-vora-accent/10 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-[11px] font-bold text-vora-tertiary uppercase tracking-[0.3em] opacity-60">
          {title}
        </h3>
      </div>
    </div>
    <div className="flex-1">{children}</div>
  </motion.div>
);

export default function AnalysisPage() {
  const { user, dashboard } = useAppStore();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="ANALİZ MERKEZİ" 
        subtitle="VERİ ODAKLI GELİŞİM RAPORLARI" 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0 mb-8">
        {/* Kilo Tahminleme */}
        <BentoCard title="KİLO TAHMİNLEME" icon={TrendingUp} className="md:col-span-8 md:row-span-2">
          <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20">
             <BarChart3 className="w-16 h-16 text-vora-accent" />
             <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-center">YAPAY ZEKA SİMÜLASYONU HAZIRLANIYOR</p>
          </div>
        </BentoCard>

        {/* Hedef Durumu */}
        <BentoCard title="HEDEF ANALİZİ" icon={Target} className="md:col-span-4 md:row-span-1">
          <div className="flex flex-col justify-center h-full space-y-4">
             <div className="flex justify-between items-center">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest">HEDEF KİLO</p>
                <p className="text-xl font-black text-vora-primary tracking-tighter">70.0 KG</p>
             </div>
             <div className="flex justify-between items-center">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest">MEVCUT</p>
                <p className="text-xl font-black text-vora-accent tracking-tighter">75.4 KG</p>
             </div>
          </div>
        </BentoCard>

        {/* Vora Insights */}
        <BentoCard title="VORA INSIGHTS" icon={Zap} className="md:col-span-4 md:row-span-1">
           <div className="h-full flex items-center justify-center opacity-10">
              <p className="text-[8px] font-bold uppercase tracking-widest">YETERLİ VERİ TOPLANMADI</p>
           </div>
        </BentoCard>
      </div>

      <footer className="mt-4 text-center opacity-20 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Predictive Health Analytics
        </p>
      </footer>
    </div>
  );
}
