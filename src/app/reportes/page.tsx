import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockMovements } from "@/data/mock-data";
import { formatCurrency, summarizeMovements } from "@/lib/utils";

export default function ReportsPage() {
  const summary = summarizeMovements(mockMovements);

  return (
    <AppShell title="Reportes" subtitle="Consulta y exportación de movimientos financieros." showExports>
      <Card>
        <CardHeader>
          <CardTitle>Filtros del reporte</CardTitle>
          <CardDescription>Selecciona el rango de fechas para preparar el reporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end">
            <Input id="start-date" label="Fecha inicial" type="date" defaultValue="2026-07-01" />
            <Input id="end-date" label="Fecha final" type="date" defaultValue="2026-07-09" />
            <Button type="button">Generar reporte</Button>
            <Button type="button" variant="secondary">Exportar PDF</Button>
            <Button type="button" variant="secondary">Exportar Excel</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total ingresos" value={formatCurrency(summary.income)} helper="Rango seleccionado" tone="income" icon="+" />
        <StatCard title="Total gastos" value={formatCurrency(summary.expense)} helper="Rango seleccionado" tone="expense" icon="-" />
        <StatCard title="Balance neto" value={formatCurrency(summary.balance)} helper="Ingresos menos gastos" tone="balance" icon="=" />
        <StatCard title="Movimientos" value={String(summary.count)} helper="Cantidad de registros" tone="neutral" icon="#" />
      </div>
    </AppShell>
  );
}


