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

  return (
    <>
      {error ? <p className="mb-5 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
      {loading ? <p className="mb-5 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando resumen financiero...</p> : null}

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total ingresos" value={formatCurrency(calculateIncomeTotal(monthMovements))} helper="Acumulado del mes" tone="income" icon="+" />
        <StatCard title="Total gastos" value={formatCurrency(calculateExpenseTotal(monthMovements))} helper="Acumulado del mes" tone="expense" icon="-" />
        <StatCard title="Balance neto" value={formatCurrency(calculateBalance(monthMovements))} helper="Resultado mensual" tone="balance" icon="=" />
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
            <CardTitle>Visual del mes</CardTitle>
            <CardDescription>Vista base para gráfico financiero de la siguiente fase.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid h-64 items-end gap-4 rounded-md bg-slate-50 p-5 sm:grid-cols-3">
              <div className="grid gap-2"><div className="h-36 rounded-md bg-mint" /><p className="text-center text-xs font-semibold text-slate-600">Ingresos</p></div>
              <div className="grid gap-2"><div className="h-28 rounded-md bg-danger-soft" /><p className="text-center text-xs font-semibold text-slate-600">Gastos</p></div>
              <div className="grid gap-2"><div className="h-20 rounded-md bg-primary-soft" /><p className="text-center text-xs font-semibold text-slate-600">Balance</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <RecentMovements movements={recentMovements} />
      </div>
    </>
  );
}
