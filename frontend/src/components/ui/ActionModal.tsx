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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-vora-background/95 flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] h-[600px] max-h-[95vh] bg-vora-surface border border-vora-border/20 rounded-[2.5rem] p-6 sm:p-8 relative shadow-2xl flex flex-col my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-vora-tertiary hover:text-vora-primary transition-colors z-50 p-2 bg-white/5 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center justify-center text-center mb-6 shrink-0 mt-2">
          {Icon && (
            <div className="w-14 h-14 bg-vora-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-vora-accent/20">
              <Icon className="w-7 h-7 text-vora-accent drop-shadow-[0_0_10px_rgba(var(--color-accent),0.5)]" />
            </div>
          )}
          <h2 className="text-2xl font-light tracking-[0.3em] uppercase mb-1.5 text-vora-primary">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-[9px] font-bold text-vora-tertiary tracking-widest uppercase">
              {subtitle}
            </p>
          ) : (
            <div className="h-1 w-10 bg-vora-accent mx-auto rounded-full mt-1" />
          )}
        </div>

        <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col justify-start">
          {children}
        </div>

        <p className="mt-6 shrink-0 text-center text-[8px] text-vora-tertiary uppercase tracking-[0.3em] font-bold opacity-30 italic">
          Sustainable Health Architecture
        </p>
      </motion.div>
    </motion.div>
  );
}
