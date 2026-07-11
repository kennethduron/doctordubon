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
import { CLINIC_NAME, DOCTOR_NAME, paymentMethodLabels } from "@/lib/constants";
import { exportMovementsToExcel, exportMovementsToPDF } from "@/lib/export";
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency, getMonthDateRange } from "@/lib/finance";
import { canViewReports } from "@/lib/roles";
import { formatDate, summarizeMovements } from "@/lib/utils";

export function ReportsContent() {
  const { role, userProfile } = useAuth();
  const range = getMonthDateRange();
  const { movements, loading, error, filterByDateRange } = useMovements({ initialStartDate: range.startDate, initialEndDate: range.endDate });
  const [startDate, setStartDate] = useState(range.startDate);
  const [endDate, setEndDate] = useState(range.endDate);
  const [notice, setNotice] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const totals = summarizeMovements(movements);

  if (!canViewReports(role)) {
    return <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">No tienes permiso para ver reportes.</p>;
  }

  async function handleGenerateReport() {
    setNotice(null);
    await filterByDateRange(startDate, endDate);
  }

  function handleExport(type: "pdf" | "excel") {
    setNotice(null);

    if (movements.length === 0) {
      setNotice("No hay movimientos para exportar en este rango de fechas.");
      return;
    }

    setExporting(type);

    try {
      const params = {
        documentType: "report" as const,
        movements,
        startDate,
        endDate,
        clinicName: CLINIC_NAME,
        doctorName: DOCTOR_NAME,
        generatedBy: userProfile?.name ?? "Usuario del consultorio",
        totals,
      };

      if (type === "pdf") {
        exportMovementsToPDF(params);
        setNotice("El reporte PDF se generó correctamente.");
      } else {
        exportMovementsToExcel(params);
        setNotice("El reporte Excel se generó correctamente.");
      }
    } catch {
      setNotice("No se pudo generar el archivo. Intente nuevamente.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filtros del reporte</CardTitle>
          <CardDescription>Selecciona el rango de fechas para preparar el reporte mensual del consultorio.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end">
            <Input id="start-date" label="Fecha inicial" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <Input id="end-date" label="Fecha final" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            <Button type="button" onClick={handleGenerateReport} disabled={loading}>Generar reporte</Button>
            <Button type="button" variant="secondary" disabled={Boolean(exporting)} onClick={() => handleExport("pdf")}>
              {exporting === "pdf" ? "Generando..." : "Exportar PDF"}
            </Button>
            <Button type="button" variant="secondary" disabled={Boolean(exporting)} onClick={() => handleExport("excel")}>
              {exporting === "excel" ? "Generando..." : "Exportar Excel"}
            </Button>
          </div>
          {notice ? <p className="mt-4 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">{notice}</p> : null}
          {error ? <p className="mt-4 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total ingresos" value={formatCurrency(calculateIncomeTotal(movements))} helper="Entradas del rango" tone="income" icon="+" />
        <StatCard title="Total gastos" value={formatCurrency(calculateExpenseTotal(movements))} helper="Salidas del rango" tone="expense" icon="-" />
        <StatCard title="Balance neto" value={formatCurrency(calculateBalance(movements))} helper="Resultado financiero" tone="balance" icon="=" />
        <StatCard title="Movimientos" value={String(totals.count)} helper="Registros incluidos" tone="neutral" icon="#" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalle del reporte</CardTitle>
          <CardDescription>Movimientos activos del rango seleccionado, listos para revisión o exportación.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando reporte...</p> : null}
          {!loading && movements.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-soft bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No hay movimientos en este rango.</p>
              <p className="mt-1 text-sm text-slate-500">Ajusta las fechas o registra un ingreso o gasto para preparar el reporte.</p>
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
