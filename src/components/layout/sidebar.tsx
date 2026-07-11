"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_DESCRIPTION, APP_NAME, CLINIC_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const navigation = [
  { href: "/dashboard", label: "Panel principal", icon: "P" },
  { href: "/resumen-financiero", label: "Resumen financiero", icon: "R" },
  { href: "/ingresos", label: "Ingresos", icon: "+" },
  { href: "/gastos", label: "Gastos", icon: "-" },
  { href: "/libro-diario", label: "Libro diario", icon: "L" },
  { href: "/reportes", label: "Reportes", icon: "E" },
  { href: "/usuarios", label: "Usuarios y permisos", icon: "U" },
  { href: "/configuracion", label: "Configuración", icon: "C" },
];

export function getNavigationForRole(role?: import('@/types/role').Role | null) {
  if (role === 'admin') {
    return navigation.filter((item) => item.href !== '/usuarios' && item.href !== '/configuracion');
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
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-border-soft bg-white lg:flex lg:flex-col">
      <div className="border-b border-border-soft px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">CF</div>
          <div>
            <p className="text-sm font-semibold text-primary">{APP_NAME}</p>
            <p className="text-xs text-slate-500">{CLINIC_NAME}</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">{APP_DESCRIPTION}</p>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {getNavigationForRole(role).map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "text-slate-600 hover:bg-primary-soft hover:text-primary",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
                  active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-soft p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center rounded-md border border-border-soft bg-white px-3 text-sm font-semibold text-primary transition hover:bg-primary-soft"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export { navigation };
