"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  ClipboardPlus,
  FileBarChart,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { StatCard } from "@/components/dashboard/stat-card";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency, getMonthDateRange } from "@/lib/finance";
import { getCurrentMonthMovements, getRecentMovements, getTodayMovements } from "@/lib/movements";
import { cn } from "@/lib/utils";
import type { Movement } from "@/types/movement";

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone: "income" | "expense" | "primary";
  heroVariant: "primary" | "secondary";
};

const quickActions: QuickAction[] = [
  { href: "/ingresos", label: "Nuevo ingreso", description: "Registrar pago recibido", icon: ArrowUpRight, tone: "income", heroVariant: "primary" },
  { href: "/gastos", label: "Nuevo gasto", description: "Registrar salida operativa", icon: ArrowDownRight, tone: "expense", heroVariant: "secondary" },
  { href: "/libro-diario", label: "Ver libro diario", description: "Consultar movimientos", icon: BookOpen, tone: "primary", heroVariant: "secondary" },
  { href: "/reportes", label: "Ver reportes", description: "Resumen financiero", icon: FileBarChart, tone: "primary", heroVariant: "secondary" },
];

const quickActionToneStyles = {
  income: "bg-mint text-mint-strong",
  expense: "bg-danger-soft text-danger",
  primary: "bg-primary-soft text-primary",
};

function DashboardHero() {
  return (
    <section className="relative mb-6 overflow-hidden rounded-xl border border-sky-200/80 bg-[linear-gradient(135deg,#f6fcff_0%,#e8f6ff_45%,#b8dcff_100%)] p-5 shadow-[0_18px_50px_rgba(15,58,95,0.10)] sm:p-7 lg:p-9">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(30,125,210,0.18),transparent_35%)]" />
      <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-full bg-white/25 blur-2xl lg:block" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_390px] lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Activity className="h-4 w-4" />
            Balance del consultorio en tiempo real
          </div>
          <h2 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">Bienvenido al centro financiero</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Registra ingresos, gastos y consulta el balance del consultorio en tiempo real.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={buttonStyles(action.heroVariant, "min-h-12 justify-center rounded-lg px-5 shadow-sm")}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative hidden min-h-56 lg:block" aria-hidden="true">
          <div className="absolute left-3 top-14 h-px w-28 bg-white/80" />
          <div className="absolute left-24 top-7 h-24 w-24 text-white/90">
            <svg viewBox="0 0 120 80" className="h-full w-full fill-none stroke-current stroke-[5]">
              <path d="M2 48h24l10-30 16 56 14-42 10 16h42" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="absolute right-4 top-2 h-44 w-32 rounded-xl border-4 border-sky-500 bg-white/80 shadow-xl shadow-sky-900/10">
            <div className="absolute -top-5 left-9 flex h-10 w-14 items-center justify-center rounded-lg bg-sky-500 text-white shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="mx-auto mt-9 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white">
              <ClipboardPlus className="h-7 w-7" />
            </div>
            <div className="mx-auto mt-5 h-2 w-20 rounded-full bg-sky-200" />
            <div className="mx-auto mt-3 h-2 w-16 rounded-full bg-sky-200" />
            <div className="mx-auto mt-3 h-2 w-24 rounded-full bg-sky-100" />
          </div>
          <div className="absolute bottom-0 left-24 grid h-24 w-20 grid-cols-3 gap-2 rounded-lg border-4 border-sky-400 bg-sky-100 p-3 shadow-lg">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="rounded bg-sky-400/75" />
            ))}
          </div>
          <div className="absolute bottom-2 right-0 flex h-24 w-20 items-center justify-center rounded-[28px] border-4 border-sky-500 bg-sky-100/90 text-sky-600 shadow-lg">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <div className="absolute right-28 top-5 grid grid-cols-6 gap-2 opacity-25">
            {Array.from({ length: 30 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActionsCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>Atajos para registrar y consultar información.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border-soft bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", quickActionToneStyles[action.tone])}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block">{action.label}</span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-500">{action.description}</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const { userProfile } = useAuth();
  const [todayMovements, setTodayMovements] = useState<Movement[]>([]);
  const [monthMovements, setMonthMovements] = useState<Movement[]>([]);
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!userProfile?.clinicId || userProfile.status !== "active") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [today, month, recent] = await Promise.all([
          getTodayMovements(userProfile.clinicId),
          getCurrentMonthMovements(userProfile.clinicId),
          getRecentMovements(userProfile.clinicId, 5),
        ]);
        setTodayMovements(today);
        setMonthMovements(month);
        setRecentMovements(recent);
      } catch {
        setError("No se pudieron cargar los datos financieros.");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [userProfile?.clinicId, userProfile?.status]);

  const todayIncome = calculateIncomeTotal(todayMovements);
  const todayExpense = calculateExpenseTotal(todayMovements);
  const monthIncome = calculateIncomeTotal(monthMovements);
  const monthExpense = calculateExpenseTotal(monthMovements);
  const monthRange = getMonthDateRange();

  return (
    <>
      {error ? <p className="mb-5 rounded-lg border border-danger-soft bg-white p-3 text-sm font-medium text-danger shadow-sm">{error}</p> : null}
      {loading ? <p className="mb-5 rounded-lg border border-primary-soft bg-white p-3 text-sm font-medium text-primary shadow-sm">Cargando información financiera...</p> : null}

      <DashboardHero />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Ingresos de hoy" value={formatCurrency(todayIncome)} helper={todayMovements.length ? "Movimientos registrados hoy" : "No hay ingresos registrados hoy"} tone="income" icon={<ArrowUpRight className="h-6 w-6" />} accentIcon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Gastos de hoy" value={formatCurrency(todayExpense)} helper={todayExpense > 0 ? "Salidas registradas hoy" : "No hay gastos registrados hoy"} tone="expense" icon={<ArrowDownRight className="h-6 w-6" />} accentIcon={<Activity className="h-4 w-4" />} />
        <StatCard title="Balance del día" value={formatCurrency(calculateBalance(todayMovements))} helper="Ingresos menos gastos" tone="balance" icon={<Calculator className="h-6 w-6" />} accentIcon={<HeartPulse className="h-4 w-4" />} />
        <StatCard title="Ingresos del mes" value={formatCurrency(monthIncome)} helper={`Desde ${monthRange.startDate}`} tone="income" icon={<ClipboardPlus className="h-6 w-6" />} accentIcon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Gastos del mes" value={formatCurrency(monthExpense)} helper={`Hasta ${monthRange.endDate}`} tone="expense" icon={<ClipboardPlus className="h-6 w-6" />} accentIcon={<Activity className="h-4 w-4" />} />
        <StatCard title="Balance del mes" value={formatCurrency(calculateBalance(monthMovements))} helper="Resultado neto mensual" tone="balance" icon={<Wallet className="h-6 w-6" />} accentIcon={<Calculator className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <RecentMovements movements={recentMovements} />
        <QuickActionsCard />
      </div>
    </>
  );
}
