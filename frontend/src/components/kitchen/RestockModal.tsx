"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Plus, Package, Zap } from "lucide-react";
import api from "@/lib/api";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAppStore } from "@/store/useAppStore";

interface RestockModalProps {
  item: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestockModal({ item, onClose, onSuccess }: RestockModalProps) {
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const notify = useNotificationStore();
  const { inventory, setInventory } = useAppStore();

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

  const handleRestock = async () => {
    setLoading(true);
    try {
      const res = await api.patch(`/inventory/${item.id}`, {
        quantity: item.quantity + Number(amount)
      });
      setInventory(inventory.map(i => i.id === item.id ? res.data : i));
      notify.show(`${item.food.name} stoğu güncellendi.`, "success");
      onSuccess();
    } catch (error) {
      notify.show("Güncelleme hatası.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-vora-bg/80 backdrop-blur-xl" >
      <motion.div ref={modalRef} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-vora-surface border border-vora-border/20 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative" >
        
        <div className="p-6 border-b border-vora-border/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-vora-accent/10 rounded-xl text-vora-accent"><Zap className="w-4 h-4" /></div>
            <h2 className="text-xs font-black text-vora-primary uppercase tracking-widest">HIZLI İKMAL</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-vora-tertiary transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-8 text-center space-y-6">
          <div>
            <p className="text-[8px] font-black text-vora-accent uppercase tracking-[0.3em] mb-1">STOK GÜNCELLENİYOR</p>
            <h3 className="text-xl font-black text-vora-primary tracking-tighter uppercase leading-tight">{item.food?.name}</h3>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-vora-tertiary uppercase tracking-widest opacity-40">EKLENECEK MİKTAR (G)</label>
            <input 
              autoFocus type="text" inputMode="numeric" value={amount} 
              onChange={(e) => setAmount(e.target.value.replace(/\D/g,''))}
              onKeyDown={(e) => e.key === 'Enter' && handleRestock()}
              className="w-full bg-transparent text-center text-5xl font-black tracking-tighter text-vora-primary outline-none" 
            />
            <div className="h-0.5 w-32 mx-auto bg-vora-accent/20 rounded-full" />
          </div>

          <div className="flex items-center justify-center gap-2">
            {[50, 100, 250, 500].map(val => (
              <button key={val} onClick={() => setAmount(val.toString())} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-vora-tertiary hover:bg-vora-accent hover:text-white transition-all uppercase">+{val}g</button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-vora-border/10">
          <button 
            onClick={handleRestock} disabled={loading || !amount}
            className="w-full py-4 bg-vora-accent text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-vora-accent/20 hover:scale-[1.02] transition-all"
          >
            {loading ? "İŞLENİYOR..." : "STOK EKLE"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
