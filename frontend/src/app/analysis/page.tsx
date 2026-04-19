"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  Clock,
  Utensils,
  Flame,
  Coffee,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const BentoCard = ({ children, className, title, icon: Icon, badge }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-vora-surface border border-white/5 rounded-[3rem] p-10 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/[0.03] rounded-2xl text-vora-tertiary border border-white/5 group-hover:text-vora-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-[11px] font-black text-vora-tertiary uppercase tracking-[0.4em] opacity-40">
          {title}
        </h3>
      </div>
      {badge && (
        <span className="text-[7px] font-black text-vora-accent bg-vora-accent/5 border border-vora-accent/10 px-3 py-1 rounded-full tracking-widest uppercase">
          {badge}
        </span>
      )}
    </div>
    <div className="flex-1 flex flex-col">{children}</div>
  </motion.div>
);

export default function AnalysisPage() {
  const { user } = useAppStore();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get("/dashboard/analysis");
        setAnalysis(res.data);
      } catch (err) {
        console.error("Analysis fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-vora-accent animate-pulse" />
          <span className="text-vora-tertiary animate-pulse font-black tracking-[0.5em] text-[10px] uppercase opacity-20">
            Veriler Hazırlanıyor
          </span>
        </div>
      </div>
    );

  const {
    projection,
    milestones,
    weeklyScore,
    consistency,
    summary7Days,
    mealDistribution,
  } = analysis || {};

  const displayMilestones =
    milestones?.length > 0
      ? milestones
      : [
          {
            label: "BAŞLANGIÇ",
            weight: user?.weight || 85,
            date: new Date().toISOString(),
          },
          {
            label: "15 GÜN",
            weight: (user?.weight || 85) - 1.2,
            date: new Date(Date.now() + 15 * 86400000).toISOString(),
          },
          {
            label: "30 GÜN",
            weight: (user?.weight || 85) - 2.5,
            date: new Date(Date.now() + 30 * 86400000).toISOString(),
          },
          {
            label: "HEDEF",
            weight: user?.targetWeight || 75,
            date:
              projection?.estimatedDate ||
              new Date(Date.now() + 60 * 86400000).toISOString(),
          },
        ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden pb-4">
      <DashboardHeader
        user={user}
        auraStreak={12}
        title="ANALİZ MERKEZİ"
        subtitle="METABOLİK DURUM VE GELİŞİM TAKİBİ"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* KİLO SİMÜLASYONU */}
        <BentoCard
          title="KİLO SİMÜLASYONU"
          icon={TrendingUp}
          badge="TAHMİNİ PROJEKSİYON"
          className="md:col-span-8 md:row-span-2"
        >
          <div className="flex-1 flex flex-col md:flex-row gap-16">
            <div className="flex-[1.2] flex flex-col justify-center border-r border-white/5 pr-16">
              <div className="space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-vora-accent uppercase tracking-[0.3em] mb-2">
                    HEDEF VARIŞ TARİHİ
                  </p>
                  <h4 className="text-6xl font-black text-white tracking-tighter leading-[0.9]">
                    {projection?.estimatedDate
                      ? format(new Date(projection.estimatedDate), "d MMMM", {
                          locale: tr,
                        })
                      : "HEDEFTE"}
                    <span className="block text-2xl text-vora-tertiary opacity-20 mt-2 font-black tracking-normal">
                      {projection?.estimatedDate
                        ? format(new Date(projection.estimatedDate), "yyyy")
                        : ""}
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                    <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-30">
                      KALAN SÜRE
                    </p>
                    <p className="text-3xl font-black text-vora-primary tracking-tighter leading-none mt-2">
                      {projection?.weeksRemaining}{" "}
                      <span className="text-xs uppercase tracking-normal opacity-40">
                        Hafta
                      </span>
                    </p>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-right">
                    <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-30">
                      GÜNLÜK AÇIK
                    </p>
                    <p className="text-3xl font-black text-vora-accent tracking-tighter leading-none mt-2">
                      -{projection?.dailyDeficit}{" "}
                      <span className="text-xs uppercase tracking-normal opacity-40">
                        kcal
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-6 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-30 mb-1">
                      METABOLİZMA
                    </p>
                    <p className="text-lg font-black text-white tracking-tighter">
                      {projection?.bmr || 0}{" "}
                      <span className="text-[8px] opacity-20 uppercase font-bold">
                        kcal
                      </span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/5" />
                  <div className="text-center">
                    <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-30 mb-1">
                      GÜNLÜK YAKILAN
                    </p>
                    <p className="text-lg font-black text-white tracking-tighter">
                      {projection?.tdee || 0}{" "}
                      <span className="text-[8px] opacity-20 uppercase font-bold">
                        kcal
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
              <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-[0.4em] mb-4 opacity-30">
                PROJEKSİYON ADIMLARI
              </p>
              {displayMilestones.map((ms: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-5 rounded-[2.5rem] border transition-all ${
                    i === 0
                      ? "bg-white/[0.03] border-white/10"
                      : i === 3
                        ? "bg-vora-accent/5 border-vora-accent/20"
                        : "bg-transparent border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-vora-accent" : i === 3 ? "bg-vora-primary" : "bg-white/10"}`}
                    />
                    <div>
                      <p className="text-[8px] font-black text-vora-tertiary uppercase tracking-widest opacity-40">
                        {ms.label}
                      </p>
                      <p className="text-[11px] font-bold text-white tracking-tight">
                        {format(new Date(ms.date), "d MMMM", { locale: tr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-vora-primary tracking-tighter leading-none">
                      {ms.weight}
                    </p>
                    <p className="text-[8px] font-bold text-vora-tertiary uppercase opacity-20 tracking-widest mt-1">
                      kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex items-start gap-4 opacity-30 italic">
            <AlertTriangle className="w-4 h-4 text-vora-accent shrink-0 mt-0.5" />
            <p className="text-[8px] font-medium leading-relaxed uppercase tracking-wider">
              Vora tarafından sunulan veriler istatistiksel tahminlerdir.
              Beslenme ve sağlık planlamalarınız için mutlaka uzman hekim veya
              yetkili sağlık kuruluşlarına danışınız. Bu simülasyon tıbbi
              tavsiye yerine geçmez.
            </p>
          </div>
        </BentoCard>

        {/* ÖĞÜN DAĞILIMI (RE-COMPACT) */}
        <BentoCard
          title="ÖĞÜN DAĞILIMI"
          icon={Utensils}
          className="md:col-span-4 md:row-span-1"
        >
          <div className="space-y-4 flex flex-col justify-center h-full">
            {[
              {
                label: "SABAH",
                type: "BREAKFAST",
                color: "bg-vora-accent",
                icon: Clock,
              },
              {
                label: "ÖĞLE",
                type: "LUNCH",
                color: "bg-vora-primary",
                icon: Utensils,
              },
              {
                label: "AKŞAM",
                type: "DINNER",
                color: "bg-vora-tertiary",
                icon: Flame,
              },
              { label: "ARA", type: "SNACK", color: "bg-white", icon: Coffee },
            ].map((item, i) => {
              const total =
                Object.values(mealDistribution || {}).reduce(
                  (a: any, b: any) => a + b,
                  0,
                ) || 1;
              const val = mealDistribution?.[item.type] || 0;
              const pct = Math.round((Number(val) / Number(total)) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[8px] font-black tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-3 h-3 text-vora-tertiary opacity-30" />
                      <span className="text-vora-tertiary opacity-40 uppercase">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-vora-primary">{pct}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className={`h-full ${item.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </BentoCard>

        {/* HAFTALIK İSTİKRAR (GRID WITH 3 DOTS) */}
        <BentoCard
          title="HAFTALIK İSTİKRAR"
          icon={ShieldCheck}
          badge={`BAŞARI %${weeklyScore || 0}`}
          className="md:col-span-4 md:row-span-1"
        >
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-8">
              {(consistency || []).length > 0 ? (
                (consistency || []).map((day: any, i: number) => {
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="flex flex-col gap-1 p-1.5 bg-white/[0.02] border border-white/5 rounded-full">
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${day.calMet ? "bg-vora-accent shadow-[0_0_8px_rgba(var(--vora-accent-rgb),0.6)]" : "bg-white/5"}`}
                        />
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${day.waterMet ? "bg-vora-primary shadow-[0_0_8px_rgba(var(--vora-primary-rgb),0.6)]" : "bg-white/5"}`}
                        />
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${day.proteinMet ? "bg-vora-tertiary shadow-[0_0_8px_rgba(var(--vora-tertiary-rgb),0.6)]" : "bg-white/5"}`}
                        />
                      </div>
                      <span
                        className={`text-[7px] font-black uppercase tracking-tighter ${isToday ? "text-vora-accent" : "opacity-20"}`}
                      >
                        {format(new Date(day.date), "EE", { locale: tr })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center opacity-10 py-10 uppercase text-[10px] font-black tracking-widest">
                  Veri Toplanıyor...
                </div>
              )}
            </div>

            <div className="flex justify-between items-end pt-8 border-t border-white/5">
              <div>
                <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-30">
                  AKTİVİTE SKORU
                </p>
                <p className="text-3xl font-black text-vora-primary tracking-tighter">
                  %{weeklyScore || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-30">
                  7G ORT. KALORİ
                </p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {summary7Days?.avgCalories || 0}
                </p>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      <footer className="mt-8 text-center opacity-5">
        <p className="text-[8px] font-black tracking-[0.5em] uppercase text-vora-tertiary">
          Vora Analitik // Adaptive Metabolic Engine
        </p>
      </footer>
    </div>
  );
}
