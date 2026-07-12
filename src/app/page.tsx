"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppLoading } from "@/components/ui/app-loading";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, loading, router]);

  return <AppLoading />;
}
