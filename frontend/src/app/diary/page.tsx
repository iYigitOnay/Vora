"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, UtensilsCrossed, Flame, Zap, Plus, Trash2, Barcode, Search, Droplets, ChevronLeft, ChevronRight, Target, Activity, Calendar } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import { QuickActionsManager, ActionType, MealType } from "@/components/dashboard/QuickActionsManager";
import { format, addDays, subDays, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

// --- Sub-Components (Senior Architecture) ---

const MacroDNALine = ({ p, c, f }: { p: number, c: number, f: number }) => {
  const total = p + c + f || 1;
  const pPct = (p / total) * 100;
  const cPct = (c / total) * 100;
  const fPct = (f / total) * 100;

  return (
    <div className="h-[3px] w-full flex rounded-full overflow-hidden opacity-60">
      <div style={{ width: `${pPct}%` }} className="bg-vora-accent shadow-[0_0_8px_rgba(var(--vora-accent-rgb),0.4)]" />
      <div style={{ width: `${cPct}%` }} className="bg-vora-primary" />
      <div style={{ width: `${fPct}%` }} className="bg-vora-tertiary" />
    </div>
  );
};

const MealQuadrant = ({ type, items, onDelete, onAdd }: any) => {
  const stats = useMemo(() => {
    return items.reduce((acc: any, item: any) => ({
      cal: acc.cal + Math.round((item.food.calories / 100) * item.amount),
      p: acc.p + (item.food.protein / 100) * item.amount,
      c: acc.c + (item.food.carbs / 100) * item.amount,
      f: acc.f + (item.food.fat / 100) * item.amount,
    }), { cal: 0, p: 0, c: 0, f: 0 });
  }, [items]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-vora-surface/40 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden relative group min-h-0"
    >
      <div className="p-5 flex justify-between items-start shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${type.color}`}>
            <type.icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[9px] font-black text-vora-tertiary uppercase tracking-[0.2em]">{type.label}</h3>
            <p className="text-lg font-black tracking-tighter text-vora-primary leading-tight">{stats.cal} <span className="text-[8px] opacity-20 uppercase">kcal</span></p>
          </div>
        </div>
        <button onClick={() => onAdd(type.id)} className="p-2 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-vora-accent hover:text-vora-on-accent outline-none">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar relative">
        <div className="space-y-2">
          {items.length > 0 ? (
            items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.03] rounded-2xl group/item">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase truncate text-vora-primary">{item.food.name}</p>
                  <p className="text-[7px] text-vora-tertiary uppercase font-black tracking-widest opacity-40 mt-0.5">{item.amount}g</p>
                </div>
                <button onClick={() => onDelete(item.id)} className="p-1.5 opacity-0 group-hover/item:opacity-100 text-red-500/20 hover:text-red-500 transition-all outline-none">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none">
              <Activity className="w-16 h-16 animate-pulse" />
              <p className="text-[8px] font-black uppercase tracking-[0.5em] mt-4">VERİ BEKLENİYOR</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 mt-auto shrink-0">
        <MacroDNALine p={stats.p} c={stats.c} f={stats.f} />
      </div>
    </motion.div>
  );
};

const ConcentricRings = ({ consumed, targets }: any) => {
  const getPct = (cur: number, target: number) => Math.min((cur / (target || 1)) * 100, 100);
  
  const rings = [
    { pct: getPct(consumed.calories, targets.calories), color: "var(--color-vora-accent)", size: 160, stroke: 8 },
    { pct: getPct(consumed.protein, targets.protein), color: "var(--color-vora-primary)", size: 120, stroke: 8 },
    { pct: getPct(consumed.water, targets.water), color: "var(--color-vora-tertiary)", size: 80, stroke: 8 },
  ];

  return (
    <div className="relative flex items-center justify-center py-6">
      <svg width="180" height="180" className="transform -rotate-90">
        {rings.map((ring, i) => {
          const radius = (ring.size - ring.stroke) / 2;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (ring.pct / 100) * circumference;
          
          return (
            <g key={i}>
              <circle cx="90" cy="90" r={radius} fill="transparent" stroke="currentColor" strokeWidth={ring.stroke} className="text-white/[0.03]" />
              <motion.circle 
                cx="90" cy="90" r={radius} fill="transparent" stroke={ring.color} strokeWidth={ring.stroke} strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <Target className="w-5 h-5 text-vora-accent opacity-20 mb-1" />
        <span className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.2em]">Daily</span>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function DiaryPage() {
  const { user, dashboard } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyMeals, setDailyMeals] = useState<any[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [initialMealType, setInitialMealType] = useState<MealType>("BREAKFAST");

  // 7-Day Restriction Logic
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => subDays(today, 6), [today]);
  
  const isAtMax = isSameDay(selectedDate, today) || isAfter(selectedDate, today);
  const isAtMin = isSameDay(selectedDate, minDate) || isBefore(selectedDate, minDate);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get(`/meal/daily?date=${selectedDate.toISOString()}`);
      setDailyMeals(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [selectedDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleDeleteItem = async (id: string) => {
    await api.delete(`/meal/item/${id}`);
    fetchLogs();
  };

  const handleAddWithContext = (mealType: MealType) => {
    setInitialMealType(mealType);
    setActiveAction("search");
  };

  const mealTypes = [
    { id: "BREAKFAST" as MealType, label: "SABAH", icon: Clock, color: "text-vora-accent" },
    { id: "LUNCH" as MealType, label: "ÖĞLE", icon: UtensilsCrossed, color: "text-vora-primary" },
    { id: "DINNER" as MealType, label: "AKŞAM", icon: Flame, color: "text-vora-tertiary" },
    { id: "SNACK" as MealType, label: "ARA", icon: Zap, color: "text-white" },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="GÜNLÜK LOG" 
        subtitle="PERFORMANS VE ANALİZ MERKEZİ" 
      />

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-8 pb-4">
        {/* Left Side: Meal Quadrants (8/12) */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full min-h-0">
          {mealTypes.map((type) => (
            <MealQuadrant 
              key={type.id} 
              type={type} 
              items={dailyMeals.find(m => m.type === type.id)?.items || []} 
              onDelete={handleDeleteItem}
              onAdd={handleAddWithContext}
            />
          ))}
        </div>

        {/* Right Side: Insights & Controls Sidebar (4/12) */}
        <div className="hidden lg:col-span-4 lg:flex flex-col h-full min-h-0">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-vora-surface border border-white/5 rounded-[3rem] p-8 flex flex-col items-center overflow-hidden h-full">
            
            {/* System Tools */}
            <div className="w-full flex items-center justify-between gap-3 mb-8 shrink-0">
              <button onClick={() => { setInitialMealType("BREAKFAST"); setActiveAction("search"); }} className="flex-1 flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group outline-none">
                <Search className="w-4 h-4 text-vora-tertiary group-hover:text-vora-primary" />
                <span className="text-[7px] font-black text-vora-tertiary uppercase tracking-widest">Arama</span>
              </button>
              <button onClick={() => { setInitialMealType("BREAKFAST"); setActiveAction("barcode"); }} className="flex-1 flex flex-col items-center gap-2 p-4 bg-vora-accent/10 border border-vora-accent/20 rounded-2xl hover:bg-vora-accent/20 transition-all group outline-none">
                <Barcode className="w-4 h-4 text-vora-accent" />
                <span className="text-[7px] font-black text-vora-accent uppercase tracking-widest">Vision</span>
              </button>
              <button onClick={() => setActiveAction("water")} className="flex-1 flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group outline-none">
                <Droplets className="w-4 h-4 text-vora-tertiary group-hover:text-vora-primary" />
                <span className="text-[7px] font-black text-vora-tertiary uppercase tracking-widest">Su Ekle</span>
              </button>
            </div>

            <h3 className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-2 opacity-30 shrink-0">GÜNLÜK SPEKTRUM</h3>
            
            <ConcentricRings 
              consumed={dashboard?.consumed || { calories: 0, protein: 0, water: 0 }} 
              targets={dashboard?.targets || { calories: 2000, protein: 150, water: 2500 }} 
            />

            {/* Fixed Spectrum Stats - No Scroll */}
            <div className="w-full space-y-3 mt-4 shrink-0">
              {[
                { label: "KALORİ", val: `${Math.round(dashboard?.consumed.calories || 0)}/${dashboard?.targets.calories}`, color: "bg-vora-accent" },
                { label: "PROTEİN", val: `${Math.round(dashboard?.consumed.protein || 0)}g/${dashboard?.targets.protein}g`, color: "bg-vora-primary" },
                { label: "SU", val: `${((dashboard?.consumed.water || 0)/1000).toFixed(1)}L/${(dashboard?.targets.water || 0)/1000}L`, color: "bg-vora-tertiary" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3.5 bg-white/[0.02] border border-white/[0.03] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-1 rounded-full ${item.color}`} />
                    <span className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-black text-vora-primary tracking-tighter">{item.val}</span>
                </div>
              ))}
            </div>

            {/* Time Control Center - With 7 Day Limit */}
            <div className="mt-auto pt-8 border-t border-white/5 w-full shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-vora-accent" />
                  <span className="text-[8px] font-black text-vora-tertiary uppercase tracking-[0.3em]">Zaman Kontrolü</span>
                </div>
                <span className="text-[7px] font-bold text-vora-accent/40 uppercase tracking-widest">7 GÜNLÜK HAFIZA</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-full">
                <button 
                  disabled={isAtMin}
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))} 
                  className={`p-3 rounded-full text-vora-tertiary transition-all outline-none ${isAtMin ? "opacity-10 cursor-not-allowed" : "hover:bg-white/5"}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <p className="text-[10px] font-black text-vora-primary uppercase tracking-widest leading-none mb-1">
                    {isSameDay(selectedDate, today) ? "BUGÜN" : format(selectedDate, "dd MMMM", { locale: tr })}
                  </p>
                  <p className="text-[8px] font-bold text-vora-accent uppercase tracking-tighter opacity-60 italic">{format(selectedDate, "EEEE", { locale: tr })}</p>
                </div>
                <button 
                  disabled={isAtMax}
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))} 
                  className={`p-3 rounded-full text-vora-tertiary transition-all outline-none ${isAtMax ? "opacity-10 cursor-not-allowed" : "hover:bg-white/5"}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <QuickActionsManager 
        activeAction={activeAction} 
        initialMealType={initialMealType}
        onClose={() => setActiveAction(null)} 
        onRefresh={fetchLogs} 
      />
    </div>
  );
}
