"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, ChefHat, Trash2, ArrowRight, Save, Scale, Flame, Zap, Droplets } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAppStore } from "@/store/useAppStore";

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateModal({ onClose, onSuccess }: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const notify = useNotificationStore();
  const { setTemplates } = useAppStore();

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await api.get(`/food/search?q=${searchQuery}`);
      setResults(res.data);
    } catch (error) {
      notify.show("Arama hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  const addItem = (food: any) => {
    if (selectedItems.find(item => item.id === food.id)) return;
    setSelectedItems([...selectedItems, { ...food, amount: 100 }]);
    setSearchQuery("");
    setResults([]);
  };

  const updateAmount = (id: string, amount: number) => {
    setSelectedItems(selectedItems.map(item => item.id === id ? { ...item, amount } : item));
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  // Dinamik Makro Hesaplama
  const totals = selectedItems.reduce((acc, curr) => {
    const factor = curr.amount / 100;
    return {
      calories: acc.calories + (curr.calories * factor),
      protein: acc.protein + (curr.protein * factor),
      carbs: acc.carbs + (curr.carbs * factor),
      fat: acc.fat + (curr.fat * factor),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleSave = async () => {
    if (!name || selectedItems.length === 0) return;
    setLoading(true);
    try {
      await api.post("/templates", {
        name,
        items: selectedItems.map(item => ({ foodId: item.id, amount: item.amount }))
      });
      const tempRes = await api.get("/templates");
      setTemplates(tempRes.data);
      notify.show("Öğün şablonu kaydedildi.", "success");
      onSuccess();
    } catch (error: any) {
      notify.show(error.response?.data?.message || "Kayıt hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-vora-bg/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-vora-surface border border-vora-border/20 w-full max-w-4xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-vora-border/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-vora-accent/10 rounded-2xl text-vora-accent"><ChefHat className="w-5 h-5" /></div>
            <div>
              <h2 className="text-sm font-black text-vora-primary uppercase tracking-tighter">ÖĞÜN MİMARI</h2>
              <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest mt-1">KOMPOZİT ÖĞÜN TASARIMI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-vora-tertiary transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Search & Build */}
          <div className="w-1/2 border-r border-vora-border/10 p-8 flex flex-col gap-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-40">ŞABLON ADI</label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value.toUpperCase())}
                placeholder="ÖRN: HAFTA İÇİ KAHVALTIM..."
                className="w-full bg-transparent text-2xl font-black tracking-tighter text-vora-primary outline-none placeholder:opacity-5" 
              />
              <div className="h-0.5 w-full bg-vora-accent/20" />
            </div>

            <div className="relative group mt-4">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-vora-tertiary opacity-30" />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="BESİN EKLE..." 
                className="w-full bg-white/[0.03] border border-vora-border/10 rounded-[2rem] py-4 pl-14 pr-6 outline-none text-vora-primary font-bold text-xs uppercase tracking-widest focus:border-vora-accent transition-all" 
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {results.map((food) => (
                <button 
                  key={food.id} onClick={() => addItem(food)}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl hover:bg-vora-accent/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-vora-accent/5 rounded-lg flex items-center justify-center text-vora-accent group-hover:bg-vora-accent group-hover:text-white transition-all"><Plus className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-vora-primary uppercase">{food.name}</p>
                      <p className="text-[8px] text-vora-tertiary uppercase tracking-widest">{food.brand || "GENEL"}</p>
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-vora-accent">{food.calories} KCAL</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Cart & Macros */}
          <div className="w-1/2 bg-white/[0.01] p-8 flex flex-col">
            <h3 className="text-[10px] font-black text-vora-tertiary uppercase tracking-[0.3em] mb-6 opacity-40">ÖĞÜN İÇERİĞİ ({selectedItems.length})</h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-8">
              {selectedItems.map((item) => (
                <motion.div 
                  layout key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-vora-surface border border-vora-border/10 rounded-2xl flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-vora-primary uppercase">{item.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <input 
                         type="text" value={item.amount} 
                         onChange={(e) => updateAmount(item.id, Number(e.target.value.replace(/\D/g,'')))}
                         className="w-12 bg-white/5 rounded-md text-center text-[10px] font-black text-vora-accent py-1 outline-none" 
                       />
                       <span className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">GRAM</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className="text-[10px] font-black text-vora-primary tracking-tighter">{Math.round(item.calories * item.amount / 100)} KCAL</p>
                     <button onClick={() => removeItem(item.id)} className="p-2 text-vora-tertiary hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              ))}
              {selectedItems.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <ChefHat className="w-12 h-12 mb-4" />
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em]">HENÜZ BESİN EKLENMEDİ</p>
                </div>
              )}
            </div>

            {/* Bottom Summary & Macros */}
            <div className="p-6 bg-vora-accent/5 border border-vora-accent/10 rounded-[2.5rem] space-y-6">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-bold text-vora-accent uppercase tracking-widest mb-1">TOPLAM ENERJİ</p>
                    <p className="text-4xl font-black text-vora-primary tracking-tighter">{Math.round(totals.calories)} <span className="text-sm font-bold text-vora-tertiary">KCAL</span></p>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={loading || !name || selectedItems.length === 0}
                    className="px-8 py-4 bg-vora-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-vora-accent/20 hover:scale-105 transition-all disabled:opacity-20"
                  >
                    {loading ? "KAYDEDİLİYOR..." : "ŞABLONU KAYDET"}
                  </button>
               </div>

               <div className="grid grid-cols-3 gap-4 pt-4 border-t border-vora-accent/10">
                  <div>
                    <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-2 h-2 text-vora-accent" /> PRO</p>
                    <p className="text-xs font-black text-vora-primary">{Math.round(totals.protein)}G</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-widest mb-1 flex items-center gap-1"><Flame className="w-2 h-2 text-vora-primary" /> KRB</p>
                    <p className="text-xs font-black text-vora-primary">{Math.round(totals.carbs)}G</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-vora-tertiary uppercase tracking-widest mb-1 flex items-center gap-1"><Droplets className="w-2 h-2 text-vora-primary" /> YAĞ</p>
                    <p className="text-xs font-black text-vora-primary">{Math.round(totals.fat)}G</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
