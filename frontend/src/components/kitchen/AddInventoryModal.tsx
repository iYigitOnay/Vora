"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Package, AlertTriangle, ArrowRight, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAppStore } from "@/store/useAppStore";

interface AddInventoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInventoryModal({ onClose, onSuccess }: AddInventoryModalProps) {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ quantity: "1000", minLimit: "200" });
  const modalRef = useRef<HTMLDivElement>(null);

  const notify = useNotificationStore();
  const { setInventory } = useAppStore();

  // ESC & Click Outside
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const handleClickOutside = (e: MouseEvent) => modalRef.current && !modalRef.current.contains(e.target as Node) && onClose();
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // LIVE SEARCH (Debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const res = await api.get(`/food/search?q=${query}`);
          setResults(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post("/inventory", {
        foodId: selectedFood.id,
        quantity: Number(form.quantity),
        unit: "g",
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-vora-bg/80 backdrop-blur-xl" >
      <motion.div ref={modalRef} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-vora-surface border border-vora-border/20 w-full max-w-lg h-[520px] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative" >
        
        {/* Header */}
        <div className="p-6 border-b border-vora-border/10 flex justify-between items-center bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-vora-accent/10 rounded-xl text-vora-accent"><Package className="w-4 h-4" /></div>
            <div>
              <h2 className="text-xs font-black text-vora-primary uppercase tracking-tighter">KİLERE EKLE</h2>
              <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest mt-0.5">DİJİTAL STOK</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl text-vora-tertiary transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden p-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full space-y-4">
                <div className="relative group shrink-0">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-vora-tertiary opacity-30 group-focus-within:text-vora-accent transition-all" />
                  <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün veya barkod ara..." className="w-full bg-white/[0.03] border border-vora-border/10 rounded-2xl py-4 pl-12 pr-6 outline-none text-xs text-vora-primary font-bold uppercase tracking-widest focus:border-vora-accent/40 transition-all" />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                  {results.map((food) => (
                    <button key={food.id} onClick={() => { setSelectedFood(food); setStep(2); }} className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-vora-border/5 rounded-2xl hover:bg-vora-accent/5 transition-all text-left" >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-vora-accent/5 rounded-lg flex items-center justify-center text-vora-accent"><Plus className="w-3.5 h-3.5" /></div>
                        <div>
                          <p className="text-[10px] font-black text-vora-primary uppercase tracking-tight truncate max-w-[180px]">{food.name}</p>
                          <p className="text-[8px] text-vora-tertiary uppercase font-bold tracking-widest">{food.brand || "GENEL"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-vora-accent tracking-tighter">{food.calories} <span className="text-[7px] text-vora-tertiary">KCAL</span></p>
                      </div>
                    </button>
                  ))}
                  {loading && <div className="py-10 text-center animate-pulse text-[8px] font-bold tracking-[0.4em] text-vora-accent uppercase">ARANIYOR...</div>}
                  {!loading && query.length > 1 && results.length === 0 && <p className="text-center text-[8px] font-bold text-vora-tertiary py-10 tracking-[0.3em] uppercase opacity-20">SONUÇ BULUNAMADI</p>}
                </div>
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col h-full justify-center space-y-8 py-2">
                <div className="text-center">
                   <p className="text-[8px] font-black text-vora-accent uppercase tracking-[0.3em] mb-1">SEÇİLEN ÜRÜN</p>
                   <h3 className="text-xl font-black text-vora-primary tracking-tighter uppercase leading-tight">{selectedFood?.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-vora-tertiary uppercase tracking-widest opacity-40 block text-center">STOK MİKTARI (G)</label>
                    <input autoFocus type="text" inputMode="numeric" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value.replace(/\D/g,'')})} className="w-full bg-transparent text-center text-4xl font-black tracking-tighter text-vora-primary outline-none" />
                    <div className="h-0.5 w-full bg-vora-accent/20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-red-400 uppercase tracking-widest opacity-40 block text-center">KRİTİK EŞİK (G)</label>
                    <input type="text" inputMode="numeric" value={form.minLimit} onChange={(e) => setForm({...form, minLimit: e.target.value.replace(/\D/g,'')})} className="w-full bg-transparent text-center text-4xl font-black tracking-tighter text-red-400 outline-none" />
                    <div className="h-0.5 w-full bg-red-400/20 rounded-full" />
                  </div>
                </div>

                <div className="bg-vora-accent/5 border border-vora-accent/10 p-5 rounded-[2rem] flex items-center gap-4">
                  <div className="p-2.5 bg-vora-accent/10 rounded-xl text-vora-accent"><AlertTriangle className="w-4 h-4 animate-pulse" /></div>
                  <p className="text-[8px] font-bold text-vora-tertiary uppercase leading-relaxed tracking-wider">
                    Sistem stok miktarınız <span className="text-vora-accent font-black">{form.minLimit}g</span> altına düştüğünde size bildirim gönderecektir.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-vora-border/10 flex gap-3 shrink-0">
           {step === 2 && (
             <button onClick={() => setStep(1)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-vora-tertiary hover:bg-white/10 transition-all"><ChevronLeft className="w-4 h-4" /></button>
           )}
           <button 
             onClick={step === 1 ? () => {} : handleAdd}
             disabled={loading || (step === 1 && !selectedFood)}
             className={`flex-1 py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg ${step === 2 ? "bg-vora-accent text-white shadow-vora-accent/20" : "bg-white/5 text-vora-tertiary opacity-20"}`}
           >
             {loading ? "..." : step === 1 ? "ÜRÜN SEÇİN" : "KİLERE KAYDET"}
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
