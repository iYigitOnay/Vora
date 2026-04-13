"use client";

import { motion } from "framer-motion";
import { Package, Library, Search, Plus, ArrowRight } from "lucide-react";
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

export default function KitchenPage() {
  const { user, dashboard } = useAppStore();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="MUTFAĞIM" 
        subtitle="BESİN KÜTÜPHANESİ & DİJİTAL KİLER" 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0 mb-8">
        {/* Dijital Kiler (Inventory) */}
        <BentoCard title="DİJİTAL KİLER" icon={Package} className="md:col-span-7 md:row-span-2">
          <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20 group-hover:opacity-40 transition-opacity">
             <Package className="w-16 h-16 text-vora-accent" />
             <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-center">STOK VERİLERİ ANALİZ EDİLİYOR</p>
          </div>
        </BentoCard>

        {/* Hızlı İşlemler */}
        <BentoCard title="MUTFAK AKSİYONLARI" icon={Plus} className="md:col-span-5 md:row-span-1">
          <div className="grid grid-cols-1 gap-3">
             <button className="flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl group/btn hover:bg-vora-accent/5 transition-all text-left">
                <div className="flex items-center gap-4">
                   <Library className="w-4 h-4 text-vora-accent" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-vora-primary">Tüm Kütüphane</span>
                </div>
                <ArrowRight className="w-4 h-4 text-vora-tertiary group-hover/btn:translate-x-1 transition-transform" />
             </button>
             <button className="flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl group/btn hover:bg-vora-accent/5 transition-all text-left">
                <div className="flex items-center gap-4">
                   <Search className="w-4 h-4 text-vora-accent" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-vora-primary">Stok Kontrol</span>
                </div>
                <ArrowRight className="w-4 h-4 text-vora-tertiary group-hover/btn:translate-x-1 transition-transform" />
             </button>
          </div>
        </BentoCard>

        {/* Son Kullanılanlar */}
        <BentoCard title="SON KULLANILANLAR" icon={Library} className="md:col-span-5 md:row-span-1">
           <div className="h-full flex items-center justify-center opacity-10">
              <p className="text-[8px] font-bold uppercase tracking-widest">VERİ YOK</p>
           </div>
        </BentoCard>
      </div>

      <footer className="mt-4 text-center opacity-20 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Sustainable Kitchen Architecture
        </p>
      </footer>
    </div>
  );
}
