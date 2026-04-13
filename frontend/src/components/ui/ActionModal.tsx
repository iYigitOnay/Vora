"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ActionModalProps {
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

export function ActionModal({
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
}: ActionModalProps) {
  // ESC ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        className="w-full max-w-xl h-[650px] bg-vora-surface border border-vora-border/20 rounded-[3rem] relative shadow-2xl overflow-hidden flex flex-col cursor-default"
      >
        {/* Sabit Header */}
        <div className="p-8 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            {Icon && (
              <div className="p-3.5 bg-vora-accent/10 text-vora-accent rounded-2xl border border-vora-accent/10">
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-light tracking-[0.2em] uppercase text-vora-primary leading-none">
                {firstWord} <span className="font-bold text-vora-accent">{restOfTitle}</span>
              </h2>
              {subtitle && (
                <p className="text-[10px] font-bold text-vora-tertiary uppercase tracking-[0.3em] mt-2 opacity-60 italic">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-full text-vora-tertiary hover:text-vora-primary transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dinamik İçerik Alanı */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {children}
        </div>

        {/* Sabit Footer Branding */}
        <div className="p-6 pt-0 text-center shrink-0">
          <p className="text-[8px] text-vora-tertiary uppercase tracking-[0.4em] font-bold opacity-20 italic">
            Vora Sustainable Health Architecture
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
