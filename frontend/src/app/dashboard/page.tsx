"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-vora-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-vora-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
