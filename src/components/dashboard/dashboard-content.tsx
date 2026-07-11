"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { StatCard } from "@/components/dashboard/stat-card";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency, getMonthDateRange } from "@/lib/finance";
import { getCurrentMonthMovements, getRecentMovements, getTodayMovements } from "@/lib/movements";
import type { Movement } from "@/types/movement";

const quickActions = [
  { href: "/ingresos", label: "Nuevo ingreso", variant: "primary" as const },
  { href: "/gastos", label: "Nuevo gasto", variant: "secondary" as const },
  { href: "/libro-diario", label: "Ver libro diario", variant: "secondary" as const },
  { href: "/reportes", label: "Ver reportes", variant: "secondary" as const },
];

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
  const hasMovements = monthMovements.length > 0 || recentMovements.length > 0;

  return (
    <>
      {error ? <p className="mb-5 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
      {loading ? <p className="mb-5 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando información financiera...</p> : null}

      {!loading && !hasMovements ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Comienza el registro financiero</CardTitle>
            <CardDescription>Agrega el primer ingreso o gasto para ver el resumen del consultorio.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/ingresos" className={buttonStyles("primary", "w-full justify-center")}>Nuevo ingreso</Link>
            <Link href="/gastos" className={buttonStyles("secondary", "w-full justify-center")}>Nuevo gasto</Link>
            <Link href="/libro-diario" className={buttonStyles("secondary", "w-full justify-center")}>Ver libro diario</Link>
            <Link href="/reportes" className={buttonStyles("secondary", "w-full justify-center")}>Ver reportes</Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Ingresos de hoy" value={formatCurrency(todayIncome)} helper={todayMovements.length ? "Movimientos registrados hoy" : "No hay ingresos registrados hoy"} tone="income" icon="+" />
        <StatCard title="Gastos de hoy" value={formatCurrency(todayExpense)} helper={todayExpense > 0 ? "Salidas registradas hoy" : "No hay gastos registrados hoy"} tone="expense" icon="-" />
        <StatCard title="Balance del día" value={formatCurrency(calculateBalance(todayMovements))} helper="Ingresos menos gastos" tone="balance" icon="=" />
        <StatCard title="Ingresos del mes" value={formatCurrency(monthIncome)} helper={`Desde ${monthRange.startDate}`} tone="income" icon="+" />
        <StatCard title="Gastos del mes" value={formatCurrency(monthExpense)} helper={`Hasta ${monthRange.endDate}`} tone="expense" icon="-" />
        <StatCard title="Balance del mes" value={formatCurrency(calculateBalance(monthMovements))} helper="Resultado neto mensual" tone="balance" icon="=" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <RecentMovements movements={recentMovements} />
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Atajos para registrar y consultar información.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className={buttonStyles(action.variant, "w-full justify-center")}>
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
