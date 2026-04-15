import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientLayoutProvider } from "@/components/layout/ClientLayoutProvider";
import { Notification } from "@/components/ui/Notification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vora // Sustainable Health Architecture",
  description: "AI Driven Health and Nutrition Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body className="min-h-full flex bg-vora-background text-vora-primary selection:bg-vora-accent/30 overflow-x-hidden">
        <ThemeProvider>
          <Notification />
          <ClientLayoutProvider>
            {children}
          </ClientLayoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
