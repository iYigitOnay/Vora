'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Notification } from "@/components/ui/Notification";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storage = localStorage.getItem('vora-theme-storage');
                if (storage) {
                  const parsed = JSON.parse(storage);
                  if (parsed.state && parsed.state.theme) {
                    document.documentElement.setAttribute('data-theme', parsed.state.theme);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex bg-vora-background text-vora-primary selection:bg-vora-accent/30">
        <ThemeProvider>
          <Notification />
          {!isAuthPage && <Sidebar />}
          <main className={cn(
            "flex-1 min-h-screen",
            !isAuthPage ? "pl-[280px]" : "pl-0"
          )}>
            <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
