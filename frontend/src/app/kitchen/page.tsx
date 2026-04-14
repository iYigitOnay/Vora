"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Library, Search, Plus, ArrowRight, Trash2, AlertTriangle, ChefHat, Info } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";

const BentoCard = ({ children, className, title, icon: Icon, action }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
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
      {action && action}
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </motion.div>
);

export default function KitchenPage() {
  const { user, dashboard, inventory, templates, setInventory, setTemplates, setLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState<"inventory" | "templates">("inventory");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, tempRes] = await Promise.all([
          api.get("/inventory"),
          api.get("/templates")
        ]);
        setInventory(invRes.data);
        setTemplates(tempRes.data);
      } catch (error) {
        console.error("Mutfak verisi çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setInventory, setTemplates, setLoading]);

  const handleDeleteInventory = async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(inventory.filter(item => item.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden">
      <DashboardHeader 
        user={user} 
        auraStreak={dashboard?.auraStreak} 
        title="MUTFAĞIM" 
        subtitle="DİJİTAL ASİSTANINIZIN KALBİ" 
      />

      {/* Tab Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-vora-surface border border-vora-border/10 p-1 rounded-full flex gap-1">
          <button 
            onClick={() => setActiveTab("inventory")}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === "inventory" ? "bg-vora-accent text-white shadow-lg shadow-vora-accent/20" : "text-vora-tertiary hover:text-vora-primary"}`}
          >
            KİLERİM
          </button>
          <button 
            onClick={() => setActiveTab("templates")}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === "templates" ? "bg-vora-accent text-white shadow-lg shadow-vora-accent/20" : "text-vora-tertiary hover:text-vora-primary"}`}
          >
            ÖĞÜNLERİM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0 mb-8 overflow-hidden">
        
        {/* Main List Area */}
        <BentoCard 
          title={activeTab === "inventory" ? "KİLER STOKLARI" : "KAYITLI ÖĞÜNLER"} 
          icon={activeTab === "inventory" ? Package : ChefHat} 
          className="md:col-span-8 h-full"
          action={
            <button className="p-2 hover:bg-vora-accent/10 rounded-xl transition-colors text-vora-accent">
              <Plus className="w-5 h-5" />
            </button>
          }
        >
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <AnimatePresence mode="wait">
              {activeTab === "inventory" ? (
                inventory.length > 0 ? (
                  inventory.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl group/item hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-vora-accent/10 rounded-xl flex items-center justify-center overflow-hidden">
                          {item.food.image ? (
                            <img src={item.food.image} alt={item.food.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-vora-accent" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-vora-primary uppercase tracking-wider">{item.food.name}</h4>
                          <p className="text-[9px] text-vora-tertiary uppercase tracking-widest">{item.food.brand || "GENEL"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-sm font-black tracking-tighter ${item.minLimit && item.quantity <= item.minLimit ? "text-red-400" : "text-vora-accent"}`}>
                            {item.quantity}{item.unit}
                          </p>
                          {item.minLimit && item.quantity <= item.minLimit && (
                            <div className="flex items-center gap-1 text-[8px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                              <AlertTriangle className="w-2 h-2" /> Kritik
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleDeleteInventory(item.id)}
                          className="p-2 text-vora-tertiary hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                    <Package className="w-16 h-16 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em]">KİLERİNİZ BOŞ</p>
                  </div>
                )
              ) : (
                templates.length > 0 ? (
                  templates.map((template) => (
                    <motion.div 
                      key={template.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 bg-white/[0.02] border border-vora-border/10 rounded-3xl group/temp hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-sm font-black text-vora-primary uppercase tracking-tight">{template.name}</h4>
                          <p className="text-[9px] text-vora-tertiary uppercase tracking-[0.2em] mt-1">
                            {template.items.length} BESİN • {Math.round(template.items.reduce((acc, curr) => acc + (curr.food.calories * curr.amount / 100), 0))} KCAL
                          </p>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 bg-vora-accent/10 text-vora-accent rounded-xl hover:bg-vora-accent hover:text-white transition-all">
                              <Plus className="w-4 h-4" />
                           </button>
                           <button className="p-2 text-vora-tertiary hover:text-red-400 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white/[0.03] border border-vora-border/10 rounded-full text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">
                            {item.food.name}
                          </span>
                        ))}
                        {template.items.length > 3 && (
                          <span className="px-3 py-1 bg-white/[0.03] border border-vora-border/10 rounded-full text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">
                            +{template.items.length - 3}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                    <ChefHat className="w-16 h-16 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em]">KAYITLI ÖĞÜN YOK</p>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </BentoCard>

        {/* Side Panel: Quick Actions & Stats */}
        <div className="md:col-span-4 flex flex-col gap-8 h-full overflow-hidden">
          
          <BentoCard title="MUTFAK ÖZETİ" icon={Info} className="flex-1">
            <div className="space-y-6">
              <div className="p-5 bg-vora-accent/5 border border-vora-accent/10 rounded-3xl">
                <p className="text-[9px] font-bold text-vora-accent uppercase tracking-widest mb-1">STOK DURUMU</p>
                <p className="text-2xl font-black text-vora-primary tracking-tighter">
                  {inventory.filter(i => i.minLimit && i.quantity <= i.minLimit).length} <span className="text-xs font-bold text-vora-tertiary uppercase tracking-widest ml-2">KRİTİK ÜRÜN</span>
                </p>
              </div>

              <div className="p-5 bg-white/[0.02] border border-vora-border/10 rounded-3xl">
                <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest mb-1">ŞABLON KULLANIMI</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black text-vora-primary tracking-tighter">
                    {templates.length} <span className="text-xs font-bold text-vora-tertiary uppercase tracking-widest ml-2">/ 2</span>
                  </p>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-vora-accent transition-all duration-1000" 
                      style={{ width: `${Math.min((templates.length / 2) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {templates.length >= 2 && (
                   <p className="text-[8px] font-bold text-vora-accent uppercase tracking-widest mt-3 animate-pulse">
                     PREMIUM İLE SINIRLARI KALDIRIN
                   </p>
                )}
              </div>
            </div>
          </BentoCard>

          <BentoCard title="HIZLI AKSİYONLAR" icon={Plus} className="shrink-0">
             <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center justify-between p-4 bg-vora-accent/10 border border-vora-accent/20 rounded-2xl group/btn hover:bg-vora-accent hover:text-white transition-all text-left">
                   <div className="flex items-center gap-4">
                      <Search className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Barkod İle Ekle</span>
                   </div>
                   <ArrowRight className="w-4 h-4 opacity-40 group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </BentoCard>

        </div>
      </div>

      <footer className="mt-4 text-center opacity-20 pb-2">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic">
          Vora AI // Advanced Kitchen Management System
        </p>
      </footer>
    </div>
  );
}
