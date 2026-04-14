"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Package, AlertTriangle, ArrowRight, ChevronLeft, Barcode } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAppStore } from "@/store/useAppStore";

interface AddInventoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInventoryModal({ onClose, onSuccess }: AddInventoryModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    quantity: "1000",
    unit: "g",
    minLimit: "200",
  });

  const notify = useNotificationStore();
  const { setInventory } = useAppStore();

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

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post("/inventory", {
        foodId: selectedFood.id,
        quantity: Number(form.quantity),
        unit: form.unit,
        minLimit: Number(form.minLimit),
      });
      
      const invRes = await api.get("/inventory");
      setInventory(invRes.data);
      
      notify.show("Ürün kilere eklendi.", "success");
      onSuccess();
    } catch (error) {
      notify.show("Ekleme hatası.", "error");
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
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-vora-surface border border-vora-border/20 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-8 border-b border-vora-border/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-vora-accent/10 rounded-2xl text-vora-accent">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-vora-primary uppercase tracking-tighter">KİLERE ÜRÜN EKLE</h2>
              <p className="text-[9px] font-bold text-vora-tertiary uppercase tracking-widest mt-1">DİJİTAL STOK YÖNETİMİ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-vora-tertiary transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex-1">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-vora-tertiary opacity-30 group-focus-within:text-vora-accent transition-all" />
                  <input 
                    autoFocus type="text" value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="ÜRÜN ARA VEYA BARKOD..." 
                    className="w-full bg-white/[0.03] border border-vora-border/10 rounded-3xl py-5 pl-16 pr-6 outline-none text-vora-primary font-bold uppercase tracking-widest focus:border-vora-accent transition-all" 
                  />
                  <button onClick={handleSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-vora-accent hover:scale-110 transition-all"><ArrowRight className="w-5 h-5" /></button>
                </div>

                <div className="space-y-2 h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {results.map((food) => (
                    <button 
                      key={food.id} 
                      onClick={() => { setSelectedFood(food); setStep(2); }}
                      className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/10 rounded-2xl hover:bg-vora-accent/5 hover:border-vora-accent/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-vora-accent/5 rounded-xl flex items-center justify-center text-vora-accent"><Plus className="w-4 h-4" /></div>
                        <div>
                          <p className="text-[11px] font-bold text-vora-primary uppercase tracking-tight">{food.name}</p>
                          <p className="text-[9px] text-vora-tertiary uppercase tracking-widest">{food.brand || "GENEL"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-vora-accent">{food.calories} KCAL</p>
                        <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">/ 100G</p>
                      </div>
                    </button>
                  ))}
                  {!loading && results.length === 0 && searchQuery && <p className="text-center text-[10px] font-bold text-vora-tertiary opacity-40 py-10 tracking-[0.3em] uppercase">SONUÇ BULUNAMADI</p>}
                </div>
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 flex-1 py-4 text-center">
                <div className="flex flex-col items-center gap-2 mb-8">
                   <p className="text-[10px] font-black text-vora-accent uppercase tracking-widest">SEÇİLEN ÜRÜN</p>
                   <h3 className="text-2xl font-black text-vora-primary tracking-tighter uppercase">{selectedFood?.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-vora-tertiary uppercase tracking-widest opacity-40">STOK MİKTARI ({form.unit})</label>
                    <input 
                      autoFocus type="text" value={form.quantity} 
                      onChange={(e) => setForm({...form, quantity: e.target.value.replace(/\D/g,'')})}
                      className="w-full bg-transparent text-center text-4xl font-black tracking-tighter text-vora-primary outline-none" 
                    />
                    <div className="h-0.5 w-full bg-vora-accent/20" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-red-400 uppercase tracking-widest opacity-40">KRİTİK EŞİK ({form.unit})</label>
                    <input 
                      type="text" value={form.minLimit} 
                      onChange={(e) => setForm({...form, minLimit: e.target.value.replace(/\D/g,'')})}
                      className="w-full bg-transparent text-center text-4xl font-black tracking-tighter text-red-400 outline-none" 
                    />
                    <div className="h-0.5 w-full bg-red-400/20" />
                  </div>
                </div>

                <div className="bg-vora-accent/5 border border-vora-accent/10 p-6 rounded-[2rem] flex items-center gap-4 text-left">
                  <div className="p-3 bg-vora-accent/10 rounded-2xl text-vora-accent animate-pulse"><AlertTriangle className="w-5 h-5" /></div>
                  <p className="text-[9px] font-bold text-vora-tertiary uppercase leading-relaxed tracking-wider">
                    Sistem stok miktarınız <span className="text-vora-accent font-black">{form.minLimit}{form.unit}</span> altına düştüğünde size otomatik bildirim gönderecektir.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 bg-white/[0.02] border-t border-vora-border/10 flex gap-4">
           {step === 2 && (
             <button onClick={() => setStep(1)} className="p-5 bg-white/5 border border-vora-border/10 rounded-2xl text-vora-tertiary hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5" /></button>
           )}
           <button 
             onClick={step === 1 ? () => {} : handleAdd}
             disabled={loading || (step === 1 && !selectedFood)}
             className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all ${step === 2 ? "bg-vora-accent text-white shadow-xl shadow-vora-accent/20" : "bg-white/5 text-vora-tertiary opacity-30"}`}
           >
             {loading ? "İŞLENİYOR..." : step === 1 ? "ÜRÜN SEÇİN" : "KİLERE EKLE"}
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
