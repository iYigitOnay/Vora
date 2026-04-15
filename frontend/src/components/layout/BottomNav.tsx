"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  CookingPot,
  BarChart3,
  Menu,
  X,
  Stethoscope,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mainNavItems = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Günlük", href: "/diary", icon: Calendar },
  { name: "Mutfak", href: "/kitchen", icon: CookingPot },
  { name: "Analiz", href: "/analysis", icon: BarChart3 },
];

const secondaryNavItems = [
  { name: "Diyetisyenim", href: "/expert", icon: Stethoscope },
  { name: "Profil", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("vora_access_token");
    window.location.href = "/auth";
  };

  if (pathname === "/auth") return null;

  return (
    <>
      {/* Mobile Drawer (Menu) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-vora-background/80 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-vora-surface border-t border-vora-border/20 rounded-t-[2.5rem] p-8 z-[70] md:hidden flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-vora-tertiary opacity-40">
                  Ekosistem
                </h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-white/5 rounded-full"
                >
                  <X className="w-4 h-4 text-vora-tertiary" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {secondaryNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-5 bg-white/[0.02] border border-vora-border/10 rounded-[1.5rem] hover:bg-vora-accent/5 transition-all"
                  >
                    <item.icon className="w-5 h-5 text-vora-accent" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-vora-primary">
                      {item.name}
                    </span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-5 bg-vora-error/5 border border-vora-error/10 rounded-[1.5rem] text-vora-error mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Oturumu Kapat
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-vora-surface/80 backdrop-blur-xl border-t border-vora-border/10 z-50 md:hidden flex items-center justify-around px-4 pb-safe">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 transition-all relative group",
                isActive ? "text-vora-accent" : "text-vora-tertiary opacity-50",
              )}
            >
              <item.icon
                className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "")}
              />
              <span className="text-[8px] font-bold uppercase tracking-widest">
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-4 w-8 h-1 bg-vora-accent rounded-full"
                />
              )}
            </Link>
          );
        })}

        {/* Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-1.5 p-2 text-vora-tertiary opacity-50"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">
            Menü
          </span>
        </button>
      </nav>
    </>
  );
}
