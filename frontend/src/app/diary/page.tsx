'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Barcode, 
  Search, 
  X,
  Camera,
  UtensilsCrossed,
  Droplets
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function DiaryPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((result) => {
        setScanResult(result);
        setShowScanner(false);
        scanner.clear();
      }, (error) => {
        // Tarama hataları sessizce geçilebilir
      });

      return () => {
        scanner.clear();
      };
    }
  }, [showScanner]);

  return (
    <div className="max-w-md mx-auto space-y-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mb-1">Kayıtlar</p>
          <h1 className="text-3xl font-light tracking-widest uppercase">GÜNLÜK</h1>
        </div>
        <button className="p-3 bg-vora-accent/5 rounded-full border border-vora-accent/20 text-vora-accent">
          <Droplets className="w-5 h-5" />
        </button>
      </header>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowScanner(true)}
          className="p-6 bg-vora-surface rounded-3xl border border-white/5 flex flex-col items-center gap-3 transition-all hover:border-vora-accent/40 group"
        >
          <div className="p-3 bg-vora-accent/10 rounded-2xl text-vora-accent group-hover:scale-110 transition-transform">
            <Barcode className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Barkod Tara</span>
        </button>

        <button className="p-6 bg-vora-surface rounded-3xl border border-white/5 flex flex-col items-center gap-3 transition-all hover:border-vora-accent/40 group">
          <div className="p-3 bg-vora-accent/10 rounded-2xl text-vora-accent group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Yemek Ara</span>
        </button>
      </div>

      {/* Meals List Placeholder */}
      <div className="space-y-4">
        {['KAHVALTI', 'ÖĞLE YEMEĞİ', 'AKŞAM YEMEĞİ', 'ATIŞTIRMALIK'].map((meal) => (
          <div key={meal} className="p-6 bg-vora-surface/50 rounded-[2rem] border border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-vora-border/10 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-vora-tertiary opacity-40" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase">{meal}</h3>
                <p className="text-[10px] text-vora-tertiary uppercase">Henüz veri yok</p>
              </div>
            </div>
            <button className="w-8 h-8 bg-vora-accent text-vora-on-accent rounded-full flex items-center justify-center shadow-lg shadow-vora-accent/20">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Scanner Overlay */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-vora-background flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-light tracking-widest uppercase">VORA VISION</h2>
              <button onClick={() => setShowScanner(false)} className="p-2 text-vora-tertiary">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-10">
              <div id="reader" className="w-full max-w-sm rounded-3xl overflow-hidden border-2 border-vora-accent/30 shadow-2xl shadow-vora-accent/10" />
              <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.3em] text-center max-w-[200px]">
                Barkodu çerçeve içine hizalayın, otomatik taranacaktır.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Result Info (Temporary) */}
      {scanResult && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-vora-accent text-vora-on-accent px-6 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase z-[110] animate-bounce">
          Barkod: {scanResult}
        </div>
      )}
    </div>
  );
}
