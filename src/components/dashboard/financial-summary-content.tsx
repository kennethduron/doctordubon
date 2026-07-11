"use client";

import { useEffect, useState } from "react";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency } from "@/lib/finance";
import { getCurrentMonthMovements, getRecentMovements, getTodayMovements } from "@/lib/movements";
import type { Movement } from "@/types/movement";

export function FinancialSummaryContent() {
  const { userProfile } = useAuth();
  const [dayMovements, setDayMovements] = useState<Movement[]>([]);
  const [monthMovements, setMonthMovements] = useState<Movement[]>([]);
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (!userProfile?.clinicId || userProfile.status !== "active") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [day, month, recent] = await Promise.all([
          getTodayMovements(userProfile.clinicId),
          getCurrentMonthMovements(userProfile.clinicId),
          getRecentMovements(userProfile.clinicId, 6),
        ]);
        setDayMovements(day);
        setMonthMovements(month);
        setRecentMovements(recent);
      } catch {
        setError("No se pudo cargar el resumen financiero.");
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();
  }, [userProfile?.clinicId, userProfile?.status]);

  const monthIncome = calculateIncomeTotal(monthMovements);
  const monthExpense = calculateExpenseTotal(monthMovements);
  const monthBalance = calculateBalance(monthMovements);
  const maxMonthlyAmount = Math.max(monthIncome, monthExpense, Math.abs(monthBalance), 1);
  const monthlyBars = [
    { label: "Ingresos", value: monthIncome, tone: "bg-mint text-mint-strong" },
    { label: "Gastos", value: monthExpense, tone: "bg-danger-soft text-danger" },
    { label: "Balance", value: monthBalance, tone: "bg-primary-soft text-primary" },
  ];

  return (
    <>
      {error ? <p className="mb-5 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
      {loading ? <p className="mb-5 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando resumen financiero...</p> : null}

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total ingresos" value={formatCurrency(monthIncome)} helper="Acumulado del mes" tone="income" icon="+" />
        <StatCard title="Total gastos" value={formatCurrency(monthExpense)} helper="Acumulado del mes" tone="expense" icon="-" />
        <StatCard title="Balance neto" value={formatCurrency(monthBalance)} helper="Resultado mensual" tone="balance" icon="=" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del día</CardTitle>
            <CardDescription>Actividad financiera registrada hoy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-md bg-mint p-4 text-sm font-semibold text-mint-strong">
              <span>Ingresos</span>
              <span>{formatCurrency(calculateIncomeTotal(dayMovements))}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-danger-soft p-4 text-sm font-semibold text-danger">
              <span>Gastos</span>
              <span>{formatCurrency(calculateExpenseTotal(dayMovements))}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-primary-soft p-4 text-sm font-semibold text-primary">
              <span>Balance</span>
              <span>{formatCurrency(calculateBalance(dayMovements))}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo del mes</CardTitle>
            <CardDescription>Vista rápida de ingresos, gastos y balance con los movimientos registrados.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {monthlyBars.map((bar) => {
              const width = `${Math.max(6, Math.round((Math.abs(bar.value) / maxMonthlyAmount) * 100))}%`;

              return (
                <div key={bar.label} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                    <span>{bar.label}</span>
                    <span>{formatCurrency(bar.value)}</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-md bg-slate-100">
                    <div className={`h-full rounded-md ${bar.tone}`} style={{ width }} />
                  </div>
                </div>
              );
            })}
            {!loading && monthMovements.length === 0 ? (
              <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">
                No hay movimientos registrados este mes.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <RecentMovements movements={recentMovements} />
      </div>
    </>
  );
}
