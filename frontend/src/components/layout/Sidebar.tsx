"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  CookingPot,
  BarChart3,
  Stethoscope,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Günlük", href: "/diary", icon: Calendar },
  { name: "Mutfağım", href: "/kitchen", icon: CookingPot },
  { name: "Analiz", href: "/analysis", icon: BarChart3 },
  { name: "Diyetisyenim", href: "/expert", icon: Stethoscope },
  { name: "Profil", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("vora_access_token");
    window.location.href = "/auth";
  };

  if (pathname === "/auth") return null;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-vora-surface border-r border-vora-border/20 z-50 flex flex-col will-change-transform shadow-2xl"
    >
      {/* Logo Section */}
      <div className="p-6 mb-8 flex items-center gap-4 overflow-hidden">
        <div className="min-w-[45px]">
          <Image
            src="/vorakurt.png"
            alt="Vora"
            width={45}
            height={45}
            style={{ height: 'auto' }}
            className="opacity-90"
          />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-xl font-light tracking-[0.3em] uppercase">
              VORA
            </span>
            <span className="text-[8px] font-bold text-vora-accent tracking-[0.2em] uppercase opacity-60">
              Holistic Rehab
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                isActive
                  ? "bg-vora-accent/5 text-vora-accent"
                  : "text-vora-tertiary hover:bg-white/5 hover:text-vora-primary",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 min-w-[20px]",
                  isActive
                    ? "stroke-[2.5px]"
                    : "opacity-50 group-hover:opacity-100",
                )}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[11px] font-bold uppercase tracking-widest"
                >
                  {item.name}
                </motion.span>
              )}

              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-vora-accent rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-4 px-4 py-3 text-vora-tertiary hover:text-vora-primary transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Kapat
              </span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-vora-error/60 hover:text-vora-error transition-colors"
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Ayrıl
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
