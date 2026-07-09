"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="rounded-lg border border-border-soft bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-primary">Cargando Centro Financiero del Consultorio...</p>
      </div>
    </main>
  );
}

