"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  title: string;
  subtitle: string;
  showExports?: boolean;
  children: ReactNode;
};

export function AppShell({ title, subtitle, showExports, children }: AppShellProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <MobileNav />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <Topbar title={title} subtitle={subtitle} showExports={showExports} />
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
