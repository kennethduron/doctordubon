import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMovements } from "@/data/mock-data";
import { formatCurrency, summarizeMovements } from "@/lib/utils";

export default function FinancialSummaryPage() {
  const day = summarizeMovements(mockMovements.filter((movement) => movement.date === "2026-07-09"));
  const month = summarizeMovements(mockMovements);

  return (
    <AppShell title="Resumen financiero" subtitle="Totales del día, del mes y balance operativo." showExports>
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total ingresos" value={formatCurrency(month.income)} helper="Acumulado del mes" tone="income" icon="+" />
        <StatCard title="Total gastos" value={formatCurrency(month.expense)} helper="Acumulado del mes" tone="expense" icon="-" />
        <StatCard title="Balance neto" value={formatCurrency(month.balance)} helper="Resultado mensual" tone="balance" icon="=" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del dia</CardTitle>
            <CardDescription>Actividad financiera registrada hoy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-md bg-mint p-4 text-sm font-semibold text-mint-strong">
              <span>Ingresos</span>
              <span>{formatCurrency(day.income)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-danger-soft p-4 text-sm font-semibold text-danger">
              <span>Gastos</span>
              <span>{formatCurrency(day.expense)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-primary-soft p-4 text-sm font-semibold text-primary">
              <span>Balance</span>
              <span>{formatCurrency(day.balance)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visual del mes</CardTitle>
            <CardDescription>Placeholder para grafico financiero de la siguiente fase.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid h-64 items-end gap-4 rounded-md bg-slate-50 p-5 sm:grid-cols-3">
              <div className="grid gap-2">
                <div className="h-36 rounded-md bg-mint" />
                <p className="text-center text-xs font-semibold text-slate-600">Ingresos</p>
              </div>
              <div className="grid gap-2">
                <div className="h-28 rounded-md bg-danger-soft" />
                <p className="text-center text-xs font-semibold text-slate-600">Gastos</p>
              </div>
              <div className="grid gap-2">
                <div className="h-20 rounded-md bg-primary-soft" />
                <p className="text-center text-xs font-semibold text-slate-600">Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}


