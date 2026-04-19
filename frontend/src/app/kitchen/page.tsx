"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Library, Search, Plus, ArrowRight, Trash2, AlertTriangle, ChefHat, Info, X, Zap, Clock, UtensilsCrossed, Flame } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/cards/DashboardHeader";
import { useAppStore } from "@/store/useAppStore";
import api from "@/lib/api";
import AddInventoryModal from "@/components/kitchen/AddInventoryModal";
import CreateTemplateModal from "@/components/kitchen/CreateTemplateModal";
import RestockModal from "@/components/kitchen/RestockModal";
import { useNotificationStore } from "@/store/useNotificationStore";

const BentoCard = ({ children, className, title, icon: Icon, action, headerAction }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-vora-surface border border-vora-border/20 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-vora-accent/5 rounded-2xl text-vora-accent border border-vora-accent/10 group-hover:scale-110 transition-transform shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        {headerAction ? headerAction : (
          <h3 className="text-[11px] font-bold text-vora-tertiary uppercase tracking-[0.3em] opacity-60">
            {title}
          </h3>
        )}
      </div>
      {action && action}
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </motion.div>
);

export default function KitchenPage() {
  const { user, dashboard, inventory, templates, setInventory, setTemplates, setLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState<"inventory" | "templates">("inventory");
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    inventory: any[];
    templates: any[];
    vora: any[];
  }>({ inventory: [], templates: [], vora: [] });
  const [addingToMeal, setAddingToMeal] = useState<{ id: string; name: string; isInventory?: boolean } | null>(null);

  const notify = useNotificationStore();

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

  // Debounced Search Logic
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ inventory: [], templates: [], vora: [] });
        return;
      }

      setIsSearching(true);
      try {
        const localInv = inventory.filter(i => 
          i.food?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          i.food?.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const localTemp = templates.filter(t => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const voraRes = await api.get(`/food/search?q=${searchQuery}`);
        const voraFiltered = voraRes.data.filter((vf: any) => 
          !inventory.some(i => i.foodId === vf.id)
        );

        setSearchResults({
          inventory: localInv,
          templates: localTemp,
          vora: voraFiltered
        });
      } catch (error) {
        console.error("Arama hatası:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, inventory, templates]);

  const handleApplyTemplate = async (templateId: string, type: string) => {
    try {
      await api.post('/meal/template/apply', { templateId, type });
      notify.show("Şablon günlüğe başarıyla eklendi.", "success");
      setApplyingTemplate(null);
    } catch (err) {
      notify.show("Şablon uygulanırken bir hata oluştu.", "error");
    }
  };

  const handleAddFoodToMeal = async (foodId: string, type: string) => {
    try {
      await api.post('/meal/log', { foodId, type, amount: 100 });
      notify.show("Besin günlüğe başarıyla eklendi.", "success");
      setAddingToMeal(null);
    } catch (err) {
      notify.show("Besin eklenirken bir hata oluştu.", "error");
    }
  };

  const handleDeleteInventory = async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(inventory.filter(item => item.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error("Şablon silme hatası:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden relative">
      <DashboardHeader user={user} auraStreak={dashboard?.auraStreak} title="MUTFAĞIM" subtitle="DİJİTAL ASİSTANINIZIN KALBİ" />

      {/* Grid Area - Analiz sayfasıyla birebir aynı iskelet */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0 mb-8">
        
        {/* Main List Area */}
        <BentoCard 
          icon={activeTab === "inventory" ? Package : ChefHat} 
          className="md:col-span-8 md:row-span-2 h-full"
          headerAction={
            <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-2xl relative">
              {["inventory", "templates"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === tab ? "text-white" : "text-vora-tertiary hover:text-vora-primary"}`}
                >
                  {tab === "inventory" ? "KİLERİM" : "ÖĞÜNLERİM"}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 bg-vora-accent rounded-xl -z-10 shadow-lg shadow-vora-accent/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          }
          action={
            <button onClick={() => activeTab === "inventory" ? setShowAddInventory(true) : setShowCreateTemplate(true)} className="p-2.5 bg-vora-accent/10 border border-vora-accent/20 rounded-xl text-vora-accent hover:bg-vora-accent hover:text-white transition-all shadow-sm" >
              <Plus className="w-5 h-5" />
            </button>
          }
        >
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-10">
            <AnimatePresence mode="popLayout">
              {activeTab === "inventory" ? (
                inventory.length > 0 ? (
                  inventory.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl group/item hover:bg-white/[0.04] transition-all" >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-vora-accent/10 rounded-xl flex items-center justify-center overflow-hidden border border-vora-accent/5">
                          {item.food?.image ? <img src={item.food.image} alt={item.food?.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-vora-accent" />}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-vora-primary uppercase tracking-wider">{item.food?.name || 'Bilinmeyen Ürün'}</h4>
                          <p className="text-[9px] text-vora-tertiary uppercase tracking-widest">{item.food?.brand || "GENEL"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedRestockItem(item)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-vora-accent/10 border border-vora-accent/20 rounded-xl text-vora-accent hover:bg-vora-accent hover:text-white transition-all opacity-0 group-hover/item:opacity-100"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-[8px] font-black uppercase tracking-widest">İKMAL</span>
                        </button>

                        <div className="text-right min-w-[60px]">
                          <p className={`text-sm font-black tracking-tighter ${item.minLimit && item.quantity <= item.minLimit ? "text-red-400" : "text-vora-accent"}`}> {item.quantity}{item.unit} </p>
                          {item.minLimit && item.quantity <= item.minLimit && <div className="flex items-center gap-1 text-[8px] font-bold text-red-400 uppercase tracking-widest animate-pulse"> <AlertTriangle className="w-2 h-2" /> Kritik </div>}
                        </div>
                        <button onClick={() => handleDeleteInventory(item.id)} className="p-2 text-vora-tertiary hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all" > <Trash2 className="w-4 h-4" /> </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                    <Package className="w-16 h-16 mb-4 text-vora-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em]">KİLERİNİZ BOŞ</p>
                    <button onClick={() => setShowAddInventory(true)} className="mt-6 px-8 py-3 bg-vora-accent text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-vora-accent/20 hover:scale-105 transition-all">İlk Ürünü Ekle</button>
                  </div>
                )
              ) : (
                templates.length > 0 ? (
                  templates.map((template) => (
                    <motion.div key={template.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-5 bg-white/[0.02] border border-vora-border/10 rounded-3xl group/temp hover:bg-white/[0.04] transition-all relative overflow-visible" >
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-left">
                          <h4 className="text-sm font-black text-vora-primary uppercase tracking-tight">{template.name}</h4>
                          <p className="text-[9px] text-vora-tertiary uppercase tracking-[0.2em] mt-1"> {template.items.length} BESİN • {Math.round(template.items.reduce((acc:any, curr:any) => acc + (curr.food.calories * curr.amount / 100), 0))} KCAL </p>
                        </div>
                        <div className="flex gap-2 relative">
                           <button 
                            onClick={() => setApplyingTemplate(applyingTemplate === template.id ? null : template.id)}
                            className={`p-2 rounded-xl transition-all shadow-lg ${applyingTemplate === template.id ? 'bg-vora-accent text-white' : 'bg-vora-accent/10 text-vora-accent hover:bg-vora-accent hover:text-white'}`}
                           > 
                            <Plus className="w-4 h-4" /> 
                           </button>
                           
                           {/* Quick Apply Menu */}
                           <AnimatePresence>
                             {applyingTemplate === template.id && (
                               <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 top-12 z-50 bg-vora-surface border border-vora-border/20 rounded-2xl p-2 shadow-2xl min-w-[140px] flex flex-col gap-1"
                               >
                                 {[
                                   { id: 'BREAKFAST', l: 'Sabah', i: Clock },
                                   { id: 'LUNCH', l: 'Öğle', i: UtensilsCrossed },
                                   { id: 'DINNER', l: 'Akşam', i: Flame },
                                   { id: 'SNACK', l: 'Ara', i: Zap }
                                 ].map(m => (
                                   <button 
                                    key={m.id}
                                    onClick={() => handleApplyTemplate(template.id, m.id)}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-left group/m"
                                   >
                                     <m.i className="w-3.5 h-3.5 text-vora-tertiary group-hover/m:text-vora-accent" />
                                     <span className="text-[9px] font-bold text-vora-primary uppercase tracking-widest">{m.l}</span>
                                   </button>
                                 ))}
                               </motion.div>
                             )}
                           </AnimatePresence>

                           <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 text-vora-tertiary hover:text-red-400 transition-all"> <Trash2 className="w-4 h-4" /> </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.items.slice(0, 3).map((item: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-white/[0.03] border border-vora-border/10 rounded-full text-[8px] font-bold text-vora-tertiary uppercase tracking-widest"> {item.food?.name} </span>
                        ))}
                        {template.items.length > 3 && <span className="px-3 py-1 bg-white/[0.03] border border-vora-border/10 rounded-full text-[8px] font-bold text-vora-tertiary uppercase tracking-widest"> +{template.items.length - 3} </span>}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                    <ChefHat className="w-16 h-16 mb-4 text-vora-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em]">KAYITLI ÖĞÜN YOK</p>
                    <button onClick={() => setShowCreateTemplate(true)} className="mt-6 px-8 py-3 bg-vora-accent text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-vora-accent/20 hover:scale-105 transition-all">Öğün Tasarla</button>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </BentoCard>

        {/* Side Panel */}
        <div className="md:col-span-4 md:row-span-2 flex flex-col gap-8 h-full">
          <BentoCard 
            title="MUTFAK ÖZETİ" 
            icon={Info} 
            className="flex-1 overflow-visible"
          >
            <div className="h-full relative flex flex-col">
              
              {/* Full Width Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vora-tertiary" />
                <input 
                  type="text"
                  placeholder="MUTFAĞIMDA VEYA VORA'DA ARA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-[10px] font-black tracking-[0.2em] uppercase focus:outline-none focus:border-vora-accent/50 focus:bg-white/[0.05] transition-all placeholder:text-vora-tertiary/20"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 rounded-lg text-vora-tertiary hover:text-vora-primary transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                  {!searchQuery ? (
                    <motion.div 
                      key="stats"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="p-6 bg-vora-accent/5 border border-vora-accent/20 rounded-[2rem] hover:bg-vora-accent/10 transition-colors group/status">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-[10px] font-black text-vora-accent uppercase tracking-[0.2em]">STOK DURUMU</p>
                          <AlertTriangle className={`w-4 h-4 text-vora-accent ${inventory.filter(i => i.minLimit && i.quantity <= i.minLimit).length > 0 ? "animate-pulse" : "opacity-20"}`} />
                        </div>
                        <p className="text-3xl font-black text-vora-primary tracking-tighter"> 
                          {inventory.filter(i => i.minLimit && i.quantity <= i.minLimit).length} 
                          <span className="text-[10px] font-bold text-vora-tertiary uppercase tracking-widest ml-3 opacity-60 text-indent-2">KRİTİK ÜRÜN</span> 
                        </p>
                      </div>

                      <div className="p-6 bg-white/[0.02] border border-vora-border/10 rounded-[2rem]">
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.2em] opacity-40">ŞABLON KOTASI</p>
                          <p className="text-[10px] font-mono font-bold text-vora-primary tracking-widest">0{templates.length} <span className="opacity-20">/</span> 02</p>
                        </div>
                        
                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(templates.length / 2) * 100}%` }}
                            className={`absolute inset-y-0 left-0 rounded-full ${templates.length >= 2 ? "bg-red-500" : "bg-vora-accent"} shadow-[0_0_15px_rgba(var(--color-accent),0.5)]`}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest opacity-30">SLOTS REMAINING</p>
                          <p className={`text-[8px] font-black uppercase tracking-widest ${templates.length >= 2 ? "text-red-500" : "text-vora-accent"}`}>
                            {2 - templates.length} KULLANILABİLİR
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col"
                    >
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                        {isSearching ? (
                          <div className="flex items-center justify-center py-20 opacity-20 animate-pulse">
                            <Search className="w-8 h-8 text-vora-accent animate-bounce" />
                          </div>
                        ) : (
                          <>
                            {/* Section: Kilerim */}
                            {searchResults.inventory.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[9px] font-black text-vora-accent uppercase tracking-[0.3em] opacity-60 ml-2">KİLERİMDEKİLER</p>
                                {searchResults.inventory.map(item => (
                                  <div key={item.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex justify-between items-center relative overflow-visible">
                                    <div className="text-left">
                                      <p className="text-[10px] font-black text-vora-primary uppercase tracking-wider">{item.food.name}</p>
                                      <p className="text-[8px] text-vora-tertiary uppercase tracking-widest font-bold opacity-60 mt-0.5">{item.quantity}{item.unit} MEVCUT</p>
                                    </div>
                                    <button 
                                      onClick={() => setAddingToMeal(addingToMeal?.id === item.foodId ? null : { id: item.foodId, name: item.food.name, isInventory: true })}
                                      className={`p-2 rounded-xl transition-all shadow-lg ${addingToMeal?.id === item.foodId ? 'bg-vora-accent text-white' : 'bg-vora-accent/10 text-vora-accent hover:bg-vora-accent hover:text-white'}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Quick Log Menu for Inventory */}
                                    <AnimatePresence>
                                      {addingToMeal?.id === item.foodId && (
                                        <motion.div 
                                          initial={{ opacity: 0, scale: 0.9, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -10 }}
                                          className="absolute right-12 top-2 z-[100] bg-vora-surface border border-vora-border/20 rounded-2xl p-2 shadow-2xl min-w-[130px] flex flex-col gap-1"
                                        >
                                          {[
                                            { id: 'BREAKFAST', l: 'Sabah', i: Clock },
                                            { id: 'LUNCH', l: 'Öğle', i: UtensilsCrossed },
                                            { id: 'DINNER', l: 'Akşam', i: Flame },
                                            { id: 'SNACK', l: 'Ara', i: Zap }
                                          ].map(m => (
                                            <button 
                                              key={m.id}
                                              onClick={() => handleAddFoodToMeal(item.foodId, m.id)}
                                              className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all text-left group/m"
                                            >
                                              <m.i className="w-3 h-3 text-vora-tertiary group-hover/m:text-vora-accent" />
                                              <span className="text-[8px] font-black text-vora-primary uppercase tracking-widest">{m.l}</span>
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Section: Vora Kütüphanesi */}
                            {searchResults.vora.length > 0 && (
                              <div className="space-y-3 pb-4">
                                <p className="text-[9px] font-black text-vora-accent uppercase tracking-[0.3em] opacity-60 ml-2">VORA KÜTÜPHANESİ</p>
                                {searchResults.vora.map(v => (
                                  <div key={v.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex justify-between items-center relative overflow-visible group/vora">
                                    <div className="text-left">
                                      <p className="text-[10px] font-black text-vora-primary uppercase tracking-wider">{v.name}</p>
                                      <p className="text-[8px] text-vora-tertiary uppercase tracking-widest font-bold opacity-60 mt-0.5">{v.brand || 'GENEL'}</p>
                                    </div>
                                    <button 
                                      onClick={() => setAddingToMeal(addingToMeal?.id === v.id ? null : { id: v.id, name: v.name })}
                                      className={`p-2 rounded-xl transition-all shadow-lg ${addingToMeal?.id === v.id ? 'bg-vora-accent text-white' : 'bg-vora-accent/10 text-vora-accent hover:bg-vora-accent hover:text-white'}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Quick Log Menu for Vora */}
                                    <AnimatePresence>
                                      {addingToMeal?.id === v.id && (
                                        <motion.div 
                                          initial={{ opacity: 0, scale: 0.9, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -10 }}
                                          className="absolute right-12 top-2 z-[100] bg-vora-surface border border-vora-border/20 rounded-2xl p-2 shadow-2xl min-w-[130px] flex flex-col gap-1"
                                        >
                                          {[
                                            { id: 'BREAKFAST', l: 'Sabah', i: Clock },
                                            { id: 'LUNCH', l: 'Öğle', i: UtensilsCrossed },
                                            { id: 'DINNER', l: 'Akşam', i: Flame },
                                            { id: 'SNACK', l: 'Ara', i: Zap }
                                          ].map(m => (
                                            <button 
                                              key={m.id}
                                              onClick={() => handleAddFoodToMeal(v.id, m.id)}
                                              className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition-all text-left group/m"
                                            >
                                              <m.i className="w-3 h-3 text-vora-tertiary group-hover/m:text-vora-accent" />
                                              <span className="text-[8px] font-black text-vora-primary uppercase tracking-widest">{m.l}</span>
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            )}

                            {searchResults.inventory.length === 0 && searchResults.templates.length === 0 && searchResults.vora.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                                <Search className="w-10 h-10 mb-4" />
                                <p className="text-[9px] font-bold uppercase tracking-widest leading-loose">HİÇBİR SONUÇ<br/>BULUNAMADI</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </BentoCard>

          <BentoCard title="ELITE ANALİZ" icon={ChefHat} className="bg-vora-accent/5 border-vora-accent/20 min-h-[180px]">
             <div className="space-y-4">
                <p className="text-[11px] text-vora-primary leading-relaxed uppercase tracking-wider font-extrabold italic"> {inventory.length > 0 ? `"${user?.firstName}, kilerindeki ürünlerin çoğu karbonhidrat odaklı. Protein stoğunu artırman disiplini korumanı sağlar."` : `"${user?.firstName}, mutfağın şu an boş. Akıllı bir takip için kilerine birkaç temel besin ekleyerek başlayalım."`} </p>
                <div className="flex items-center gap-2 opacity-30"> <div className="w-1.5 h-1.5 rounded-full bg-vora-accent" /> <p className="text-[9px] font-bold uppercase tracking-[0.3em]">{user?.persona || "VORA"} ENGINE</p> </div>
             </div>
          </BentoCard>
        </div>
      </div>

      <footer className="mt-4 text-center opacity-20 pb-2 shrink-0">
        <p className="text-[8px] font-medium tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed text-vora-tertiary italic text-vora-accent"> Vora AI // Advanced Kitchen Management System </p>
      </footer>

      <AnimatePresence>
        {showAddInventory && <AddInventoryModal onClose={() => setShowAddInventory(false)} onSuccess={() => setShowAddInventory(false)} />}
        {showCreateTemplate && <CreateTemplateModal onClose={() => setShowCreateTemplate(false)} onSuccess={() => setShowCreateTemplate(false)} />}
        {selectedRestockItem && (
          <RestockModal 
            item={selectedRestockItem} 
            onClose={() => setSelectedRestockItem(null)} 
            onSuccess={() => setSelectedRestockItem(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
