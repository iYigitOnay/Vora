"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-vora-accent" />,
  error: <AlertCircle className="w-5 h-5 text-vora-error" />,
  info: <Info className="w-5 h-5 text-vora-secondary" />,
  warning: <AlertTriangle className="w-5 h-5 text-vora-warning" />,
};

const bgColors = {
  success: "bg-vora-accent/10 border-vora-accent/20",
  error: "bg-vora-error/10 border-vora-error/20",
  info: "bg-vora-secondary/10 border-vora-secondary/20",
  warning: "bg-vora-warning/10 border-vora-warning/20",
};

export function Notification() {
  const { message, type, isVisible, hide } = useNotificationStore();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
          className={`fixed top-10 left-1/2 z-[200] min-w-[320px] max-w-md p-4 rounded-3xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${bgColors[type]}`}
        >
          <div className="shrink-0">{icons[type]}</div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vora-primary leading-tight">
              {message}
            </p>
          </div>
          <button onClick={hide} className="p-1 hover:bg-white/5 rounded-lg transition-colors text-vora-tertiary">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
