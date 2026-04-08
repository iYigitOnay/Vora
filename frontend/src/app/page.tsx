'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-md mx-auto space-y-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mb-1">Bugün</p>
          <h1 className="text-3xl font-light tracking-widest uppercase">MERKEZ</h1>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-vora-accent">
            <Zap className="w-4 h-4 fill-vora-accent" />
            <span className="text-xl font-bold tracking-tighter">850</span>
          </div>
          <p className="text-[8px] font-bold text-vora-tertiary uppercase tracking-widest">Aura Skoru</p>
        </div>
      </header>

      {/* Calorie Ring Placeholder */}
      <div className="aspect-square w-full max-w-[280px] mx-auto relative flex items-center justify-center">
        <div className="absolute inset-0 border-[1px] border-vora-border/20 rounded-full" />
        <div className="absolute inset-4 border-[12px] border-vora-accent/10 rounded-full" />
        <motion.div 
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          className="absolute inset-4 border-[12px] border-vora-accent rounded-full border-t-transparent border-l-transparent"
        />
        <div className="text-center">
          <p className="text-4xl font-black tracking-tighter mb-1">1,240</p>
          <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.2em]">Kcal Kaldı</p>
        </div>
      </div>

      {/* Macros Section */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Karb', val: '45g', p: 'w-1/3' },
          { label: 'Prot', val: '82g', p: 'w-2/3' },
          { label: 'Yağ', val: '12g', p: 'w-1/4' }
        ].map((m) => (
          <div key={m.label} className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <span className="text-[8px] font-bold text-vora-tertiary uppercase">{m.label}</span>
              <span className="text-[10px] font-bold">{m.val}</span>
            </div>
            <div className="h-[2px] w-full bg-vora-border/20 rounded-full overflow-hidden">
              <div className={`h-full bg-vora-accent ${m.p} rounded-full`} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
