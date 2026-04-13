"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ActionModalProps {
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  icon?: any;
  children: React.ReactNode;
}

export function ActionModal({ onClose, title, subtitle, icon: Icon, children }: ActionModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const displayTitle = typeof title === 'string' ? title : '';
  const words = displayTitle.split(' ');
  const firstWord = words.length > 1 ? words[0] : '';
  const restOfTitle = words.length > 1 ? words.slice(1).join(' ') : displayTitle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-vora-background/95 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        // Senior Standard: 500x600 fixed frame. No scrolling, no height jumps.
        className="w-full max-w-[500px] h-[600px] bg-vora-surface border border-vora-border/20 rounded-[3rem] relative shadow-2xl overflow-hidden flex flex-col cursor-default"
      >
        {/* Fixed Header (80px) */}
        <div className="h-[100px] px-8 flex items-center justify-between shrink-0 border-b border-white/[0.02]">
          <div className="flex items-center gap-5">
            {Icon && (
              <div className="p-3 bg-vora-accent/10 text-vora-accent rounded-2xl border border-vora-accent/10">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-light tracking-[0.2em] uppercase text-vora-primary leading-none">
                {firstWord} <span className="font-bold text-vora-accent">{restOfTitle}</span>
              </h2>
              {subtitle && (
                <p className="text-[9px] text-vora-tertiary uppercase tracking-[0.3em] mt-2 font-bold opacity-40 italic">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-vora-tertiary group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Action Content (420px) - Center aligned, No scrolling allowed */}
        <div className="flex-1 px-8 overflow-hidden relative">
          {children}
        </div>

        {/* Fixed Footer (80px) */}
        <div className="h-[80px] border-t border-vora-border/5 bg-white/[0.01] flex justify-center items-center shrink-0">
          <div className="flex items-center gap-2.5 opacity-20">
            <div className="w-1 h-1 rounded-full bg-vora-accent animate-pulse" />
            <p className="text-[7px] text-vora-tertiary uppercase tracking-[0.6em] font-bold italic">
              VORA SYSTEM ARCHITECTURE
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
