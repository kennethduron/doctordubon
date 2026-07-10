"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { useMovements } from "@/hooks/use-movements";
import { paymentMethodLabels } from "@/lib/constants";
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency, getMonthDateRange } from "@/lib/finance";
import { canViewReports } from "@/lib/roles";
import { formatDate } from "@/lib/utils";

export function ReportsContent() {
  const { role } = useAuth();
  const range = getMonthDateRange();
  const { movements, loading, error, filterByDateRange } = useMovements({ initialStartDate: range.startDate, initialEndDate: range.endDate });
  const [startDate, setStartDate] = useState(range.startDate);
  const [endDate, setEndDate] = useState(range.endDate);
  const [notice, setNotice] = useState<string | null>(null);

  if (!canViewReports(role)) {
    return <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">No tienes permiso para ver reportes.</p>;
  }

  async function handleGenerateReport() {
    setNotice(null);
    await filterByDateRange(startDate, endDate);
  }

  function handleUnavailableExport() {
    setNotice("La exportación PDF y Excel estará disponible en la siguiente fase.");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filtros del reporte</CardTitle>
          <CardDescription>Selecciona el rango de fechas para preparar el reporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end">
            <Input id="start-date" label="Fecha inicial" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input id="end-date" label="Fecha final" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            <Button type="button" onClick={handleGenerateReport}>Generar reporte</Button>
            <Button type="button" variant="secondary" onClick={handleUnavailableExport}>Exportar PDF</Button>
            <Button type="button" variant="secondary" onClick={handleUnavailableExport}>Exportar Excel</Button>
          </div>
          {notice ? <p className="mt-4 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">{notice}</p> : null}
          {error ? <p className="mt-4 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total ingresos" value={formatCurrency(calculateIncomeTotal(movements))} helper="Rango seleccionado" tone="income" icon="+" />
        <StatCard title="Total gastos" value={formatCurrency(calculateExpenseTotal(movements))} helper="Rango seleccionado" tone="expense" icon="-" />
        <StatCard title="Balance neto" value={formatCurrency(calculateBalance(movements))} helper="Ingresos menos gastos" tone="balance" icon="=" />
        <StatCard title="Movimientos" value={String(movements.length)} helper="Cantidad de registros" tone="neutral" icon="#" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalle del reporte</CardTitle>
          <CardDescription>Movimientos activos del rango seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando reporte...</p> : null}
          {!loading && movements.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-soft bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No hay movimientos en este rango.</p>
              <p className="mt-1 text-sm text-slate-500">Ajusta las fechas o registra un movimiento.</p>
            </div>
          ) : null}
          {movements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Tipo</Th>
                    <Th>Categoría</Th>
                    <Th>Descripción</Th>
                    <Th>Método</Th>
                    <Th className="text-right">Monto</Th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id}>
                      <Td>{formatDate(movement.date)}</Td>
                      <Td><Badge variant={movement.type === "income" ? "income" : "expense"}>{movement.type === "income" ? "Ingreso" : "Gasto"}</Badge></Td>
                      <Td>{movement.category}</Td>
                      <Td>{movement.description}</Td>
                      <Td>{paymentMethodLabels[movement.paymentMethod]}</Td>
                      <Td className="text-right font-semibold">{formatCurrency(movement.amount)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
