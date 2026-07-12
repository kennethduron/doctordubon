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
  CalendarDays,
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
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency, formatLongDate, formatMonthYear, getMonthDateRange } from "@/lib/finance";
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
    <section className="relative mb-5 overflow-hidden rounded-xl border border-sky-200/80 bg-[linear-gradient(135deg,#f7fcff_0%,#e8f6ff_48%,#c6e3ff_100%)] p-4 shadow-[0_18px_45px_rgba(15,58,95,0.09)] sm:p-5 lg:p-6">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_82%_74%,rgba(30,125,210,0.16),transparent_34%)]" />
      <div className="relative grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Activity className="h-4 w-4" />
            Balance del consultorio en tiempo real
          </div>
          <h2 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">Bienvenido al centro financiero</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Registra ingresos, gastos y consulta el balance del consultorio en tiempo real.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={buttonStyles(action.heroVariant, "min-h-11 justify-center rounded-lg px-4 shadow-sm")}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative hidden min-h-40 lg:block" aria-hidden="true">
          <div className="absolute left-0 top-12 h-px w-24 bg-white/80" />
          <div className="absolute left-12 top-5 h-20 w-24 text-white/90">
            <svg viewBox="0 0 120 80" className="h-full w-full fill-none stroke-current stroke-[5]">
              <path d="M2 48h24l10-30 16 56 14-42 10 16h42" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="absolute right-5 top-1 h-36 w-28 rounded-xl border-4 border-sky-500 bg-white/80 shadow-xl shadow-sky-900/10">
            <div className="absolute -top-4 left-8 flex h-9 w-12 items-center justify-center rounded-lg bg-sky-500 text-white shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="mx-auto mt-8 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white">
              <ClipboardPlus className="h-6 w-6" />
            </div>
            <div className="mx-auto mt-4 h-2 w-18 rounded-full bg-sky-200" />
            <div className="mx-auto mt-2 h-2 w-14 rounded-full bg-sky-200" />
            <div className="mx-auto mt-2 h-2 w-20 rounded-full bg-sky-100" />
          </div>
          <div className="absolute bottom-1 left-20 grid h-20 w-16 grid-cols-3 gap-1.5 rounded-lg border-4 border-sky-400 bg-sky-100 p-2.5 shadow-lg">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="rounded bg-sky-400/75" />
            ))}
          </div>
          <div className="absolute bottom-2 right-0 flex h-20 w-16 items-center justify-center rounded-[24px] border-4 border-sky-500 bg-sky-100/90 text-sky-600 shadow-lg">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActionsCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>Atajos para registrar y consultar información.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 p-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-12 items-center justify-between gap-3 rounded-lg border border-border-soft bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:shadow-md"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", quickActionToneStyles[action.tone])}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{action.label}</span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{action.description}</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" />
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
  const todayLabel = formatLongDate();
  const monthLabel = formatMonthYear();

  return (
    <>
      {error ? <p className="mb-4 rounded-lg border border-danger-soft bg-white p-3 text-sm font-medium text-danger shadow-sm">{error}</p> : null}
      {loading ? <p className="mb-4 rounded-lg border border-primary-soft bg-white p-3 text-sm font-medium text-primary shadow-sm">Cargando información financiera...</p> : null}

      <DashboardHero />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Hoy</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-950">{todayLabel}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Mes actual</p>
          <p className="mt-1 text-sm font-semibold capitalize text-slate-950">{monthLabel}</p>
        </div>
        <div className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Período mensual</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{monthRange.startDate} al {monthRange.endDate}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Ingresos de hoy" value={formatCurrency(todayIncome)} helper={todayMovements.length ? "Movimientos registrados hoy" : "No hay ingresos registrados hoy"} tone="income" icon={<ArrowUpRight className="h-5 w-5" />} accentIcon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Gastos de hoy" value={formatCurrency(todayExpense)} helper={todayExpense > 0 ? "Salidas registradas hoy" : "No hay gastos registrados hoy"} tone="expense" icon={<ArrowDownRight className="h-5 w-5" />} accentIcon={<Activity className="h-4 w-4" />} />
        <StatCard title="Balance del día" value={formatCurrency(calculateBalance(todayMovements))} helper="Ingresos menos gastos" tone="balance" icon={<Calculator className="h-5 w-5" />} accentIcon={<HeartPulse className="h-4 w-4" />} />
        <StatCard title="Ingresos del mes" value={formatCurrency(monthIncome)} helper={`Mes actual: ${monthLabel}`} tone="income" icon={<CalendarDays className="h-5 w-5" />} accentIcon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Gastos del mes" value={formatCurrency(monthExpense)} helper={`Mes actual: ${monthLabel}`} tone="expense" icon={<CalendarDays className="h-5 w-5" />} accentIcon={<Activity className="h-4 w-4" />} />
        <StatCard title="Balance del mes" value={formatCurrency(calculateBalance(monthMovements))} helper="Resultado neto mensual" tone="balance" icon={<Wallet className="h-5 w-5" />} accentIcon={<Calculator className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">
        <RecentMovements movements={recentMovements} />
        <QuickActionsCard />
      </div>
    </>
  );
}