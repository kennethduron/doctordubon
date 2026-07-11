"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, HeartPulse, Home, LogOut, PieChart, Settings, TrendingDown, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { APP_DESCRIPTION, APP_NAME, CLINIC_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/role";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tone: "primary" | "income" | "expense" | "neutral";
};

const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "Panel principal", icon: Home, tone: "primary" },
  { href: "/resumen-financiero", label: "Resumen financiero", icon: PieChart, tone: "neutral" },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp, tone: "income" },
  { href: "/gastos", label: "Gastos", icon: TrendingDown, tone: "expense" },
  { href: "/libro-diario", label: "Libro diario", icon: BookOpen, tone: "neutral" },
  { href: "/reportes", label: "Reportes", icon: BarChart3, tone: "primary" },
  { href: "/usuarios", label: "Usuarios y permisos", icon: UsersRound, tone: "neutral" },
  { href: "/configuracion", label: "Configuración", icon: Settings, tone: "neutral" },
];

const iconToneStyles = {
  primary: "bg-primary-soft text-primary",
  income: "bg-mint text-mint-strong",
  expense: "bg-danger-soft text-danger",
  neutral: "bg-slate-100 text-slate-500",
};

export function getNavigationForRole(role?: Role | null) {
  if (role === "admin") {
    return navigation.filter((item) => item.href !== "/usuarios" && item.href !== "/configuracion");
  }

  return navigation;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-border-soft bg-white/95 shadow-[12px_0_40px_rgba(15,58,95,0.04)] lg:flex lg:flex-col">
      <div className="border-b border-border-soft px-6 py-7">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f3a5f,#0f70b7)] text-white shadow-lg shadow-primary/20">
            <HeartPulse className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold leading-6 text-primary">{APP_NAME}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{CLINIC_NAME}</p>
          </div>
        </div>
        <p className="mt-6 rounded-lg bg-primary-soft/70 p-3 text-xs leading-5 text-slate-600">{APP_DESCRIPTION}</p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {getNavigationForRole(role).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
                active ? "bg-[linear-gradient(135deg,#0f3a5f,#075b9a)] text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-sky-50 hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition",
                  active ? "bg-white/15 text-white" : iconToneStyles[item.tone],
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-soft p-5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-border-soft bg-white px-3 text-sm font-semibold text-primary shadow-sm transition hover:border-sky-200 hover:bg-primary-soft"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export { navigation };
