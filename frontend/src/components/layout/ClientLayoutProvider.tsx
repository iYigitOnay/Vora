"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function ClientLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <>
      {!isAuthPage && <Sidebar />}
      <main
        className={cn(
          "flex-1 min-h-screen",
          !isAuthPage ? "pl-[280px]" : "pl-0",
        )}
      >
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </>
  );
}
