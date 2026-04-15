"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Star, ArrowRight, ShieldCheck } from "lucide-react";
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

export default function SpecialistPage() {
  const { user, dashboard } = useAppStore();

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="DİYETİSYENİM" 
        subtitle="UZMAN DESTEĞİ & CANLI TAKİP" 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0 mb-8">
        {/* Uzman Listesi */}
        <BentoCard title="ÖNERİLEN UZMANLAR" icon={Users} className="md:col-span-7 md:row-span-2">
          <div className="space-y-4">
             {[1, 2].map((i) => (
                <div key={i} className="p-5 bg-white/[0.02] border border-vora-border/10 rounded-[2rem] flex items-center justify-between group/item hover:bg-vora-accent/[0.03] transition-all cursor-pointer">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-vora-accent/10 border border-vora-accent/20 flex items-center justify-center">
                         <Users className="w-6 h-6 text-vora-accent" />
                      </div>
                      <div>
                         <p className="text-sm font-bold uppercase tracking-tight text-vora-primary">Uzm. Dyt. Vora Örnek</p>
                         <div className="flex items-center gap-2 mt-1">
                            <Star className="w-3 h-3 text-vora-warning fill-vora-warning" />
                            <span className="text-[9px] font-bold text-vora-tertiary">4.9 (120+ Danışan)</span>
                         </div>
                      </div>
                   </div>
                   <ArrowRight className="w-5 h-5 text-vora-tertiary group-hover/item:translate-x-1 transition-all" />
                </div>
             ))}
          </div>
        </BentoCard>

        {/* Abonelik Durumu */}
        <BentoCard title="PROFESSIONAL PANEL" icon={ShieldCheck} className="md:col-span-5 md:row-span-1">
           <div className="h-full flex flex-col justify-center space-y-4">
              <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-widest leading-relaxed opacity-60">
                 Diyetisyeniniz verilerinizi anlık olarak takip edebilir.
              </p>
              <button className="w-full py-4 bg-vora-accent/10 border border-vora-accent/20 text-vora-accent rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-vora-accent/20 transition-all">
                 PANELİ AKTİF ET
              </button>
           </div>
        </BentoCard>

        {/* Mesajlar */}
        <BentoCard title="SON MESAJLAR" icon={MessageSquare} className="md:col-span-5 md:row-span-1">
           <div className="h-full flex items-center justify-center opacity-10">
              <p className="text-[8px] font-bold uppercase tracking-widest">MESAJ YOK</p>
           </div>
        </BentoCard>
      </div>

      <footer className="mt-4 text-center opacity-20 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Professional Expert Marketplace
        </p>
      </footer>
    </div>
  );
}
