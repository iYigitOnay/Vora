"use client";

import { motion } from "framer-motion";
import { User, Ruler, Weight, Target, Settings, Palette, LogOut, Shield } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useRouter } from "next/navigation";

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

export default function ProfilePage() {
  const { user, dashboard, clearAll } = useAppStore();
  const { theme, setTheme } = useThemeStore();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("vora_access_token");
    clearAll();
    router.push("/auth");
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="PROFİLİM" 
        subtitle="BİYOMETRİK VERİLER & PERSONA" 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0 mb-8">
        {/* Biyometri Kartı */}
        <BentoCard title="BİYOMETRİK VERİLER" icon={Shield} className="md:col-span-7 md:row-span-2">
          <div className="grid grid-cols-2 gap-8">
             <div className="space-y-1">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-50">İSİM</p>
                <p className="text-xl font-black text-vora-primary tracking-tighter">{user?.firstName}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-50">HEDEF</p>
                <p className="text-xl font-black text-vora-accent tracking-tighter">{user?.goal}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-50">KİLO</p>
                <p className="text-xl font-black text-vora-primary tracking-tighter">75.4 KG</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest opacity-50">BOY</p>
                <p className="text-xl font-black text-vora-primary tracking-tighter">180 CM</p>
             </div>
          </div>
        </BentoCard>

        {/* Tema / Persona Seçimi */}
        <BentoCard title="GÖRÜNÜM" icon={Palette} className="md:col-span-5 md:row-span-1">
           <div className="grid grid-cols-4 gap-3 h-full items-center">
              {['EMBER_MOSS', 'AURA_LIGHT', 'NEURAL_DARK', 'FORGE_MODE'].map((t) => (
                 <button 
                  key={t}
                  onClick={() => setTheme(t as any)}
                  className={`w-full aspect-square rounded-2xl border transition-all ${theme === t ? 'border-vora-accent bg-vora-accent/10 shadow-lg' : 'border-vora-border/20 bg-white/[0.02]'}`}
                 />
              ))}
           </div>
        </BentoCard>

        {/* Sistem İşlemleri */}
        <BentoCard title="SİSTEM" icon={Settings} className="md:col-span-5 md:row-span-1">
           <div className="flex flex-col gap-3">
              <button className="w-full py-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-left px-6">
                 ŞİFRE DEĞİŞTİR
              </button>
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-vora-error/5 border border-vora-error/20 text-vora-error rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-vora-error/10 transition-all text-left px-6 flex items-center justify-between"
              >
                 OTURUMU KAPAT
                 <LogOut className="w-4 h-4" />
              </button>
           </div>
        </BentoCard>
      </div>

      <footer className="mt-4 text-center opacity-20 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Secure User Identity Architecture
        </p>
      </footer>
    </div>
  );
}
