"use client";

import { motion } from "framer-motion";
import { Clock, UtensilsCrossed, Flame, Zap, Plus, Trash2, ChevronLeft, ChevronRight, Barcode, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import { QuickActionsManager, ActionType } from "@/components/dashboard/QuickActionsManager";

const BentoCard = ({ children, className, title, icon: Icon, colorClass = "text-vora-accent" }: any) => (
  <motion.div
    className={`bg-vora-surface border border-vora-border/20 rounded-[2.5rem] p-6 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 bg-white/5 rounded-xl border border-white/5 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
  </motion.div>
);

export default function DiaryPage() {
  const { user, dashboard } = useAppStore();
  const [dailyMeals, setDailyMeals] = useState<any[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get(`/meal/daily?date=${new Date().toISOString()}`);
      setDailyMeals(res.data);
    } catch (err) {
      console.error("Kayıtlar çekilemedi:", err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/meal/item/${id}`);
      fetchLogs();
    } catch (err) {
      console.error("Silinemedi:", err);
    }
  };

  const mealTypes = [
    { id: "BREAKFAST", label: "KAHVALTI", icon: Clock, color: "text-vora-accent" },
    { id: "LUNCH", label: "ÖĞLE YEMEĞİ", icon: UtensilsCrossed, color: "text-vora-secondary" },
    { id: "DINNER", label: "AKŞAM YEMEĞİ", icon: Flame, color: "text-vora-error" },
    { id: "SNACK", label: "ATIŞTIRMALIK", icon: Zap, color: "text-vora-warning" },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="GÜNLÜK LOG" 
        subtitle="BESLENME VE HİDRASYON TAKİBİ" 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 mb-6">
        {/* Timeline Bento Grid */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {mealTypes.map((type) => {
            const mealData = dailyMeals.find((m) => m.type === type.id);
            return (
              <BentoCard key={type.id} title={type.label} icon={type.icon} colorClass={type.color} className="h-[280px]">
                {mealData && mealData.items.length > 0 ? (
                  <div className="space-y-3">
                    {mealData.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-vora-border/10 rounded-2xl group/item transition-all hover:bg-vora-accent/[0.03]">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-vora-primary">{item.food.name}</p>
                          <p className="text-[8px] text-vora-tertiary uppercase tracking-widest mt-0.5">
                            {item.amount}g • {Math.round((item.food.calories / 100) * item.amount)} KCAL
                          </p>
                        </div>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-2 opacity-0 group-hover/item:opacity-100 text-vora-error/40 hover:text-vora-error transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-3">
                    <Plus className="w-8 h-8" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em]">VERİ GİRİŞİ YOK</p>
                  </div>
                )}
              </BentoCard>
            );
          })}
        </div>

        {/* Vision Center Sidebar Bento */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <BentoCard title="VISION CENTER" icon={Barcode} className="flex-1">
            <div className="flex flex-col gap-3 h-full justify-center">
              <button onClick={() => setActiveAction("barcode")} className="p-5 bg-vora-accent text-vora-on-accent rounded-[2rem] flex items-center justify-between group transition-all shadow-xl shadow-vora-accent/10 hover:brightness-110">
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">HIZLI TARAMA</p>
                  <p className="text-sm font-bold tracking-tight uppercase">BARKOD OKUT</p>
                </div>
                <Barcode className="w-8 h-8 opacity-30 group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => setActiveAction("search")} className="p-5 bg-white/[0.02] border border-vora-border/20 rounded-[2rem] flex items-center justify-between group transition-all hover:bg-vora-accent/5">
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-widest text-vora-tertiary mb-1">KÜTÜPHANEDEN</p>
                  <p className="text-sm font-bold tracking-tight uppercase text-vora-primary">BESİN ARA</p>
                </div>
                <Search className="w-6 h-6 text-vora-accent opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </BentoCard>

          <BentoCard title="GÜNLÜK ÖZET" icon={Zap} className="h-48">
             <div className="flex flex-col justify-center h-full space-y-4">
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-bold text-vora-tertiary uppercase">TOPLAM ALINAN</p>
                   <p className="text-lg font-black text-vora-primary tracking-tighter">{Math.round(dashboard?.consumed.calories || 0)} KCAL</p>
                </div>
                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-vora-accent" 
                    style={{ width: `${Math.min(((dashboard?.consumed.calories || 0) / (dashboard?.targets.calories || 1)) * 100, 100)}%` }} 
                   />
                </div>
             </div>
          </BentoCard>
        </div>
      </div>

      <QuickActionsManager activeAction={activeAction} onClose={() => setActiveAction(null)} onRefresh={fetchLogs} />

      <footer className="mt-4 text-center opacity-20 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Data-Driven Nutrition Logs
        </p>
      </footer>
    </div>
  );
}
