"use client";

import { useMemo, useState } from "react";
import { EditMovementDialog } from "@/components/forms/edit-movement-dialog";
import { MovementForm } from "@/components/forms/movement-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { useMovements } from "@/hooks/use-movements";
import { CLINIC_NAME, DOCTOR_NAME, paymentMethodLabels } from "@/lib/constants";
import { exportMovementsToExcel, exportMovementsToPDF } from "@/lib/export";
import { calculateBalance, calculateExpenseTotal, calculateIncomeTotal, formatCurrency } from "@/lib/finance";
import { canCreateMovements, canDeleteMovements, canEditMovements } from "@/lib/roles";
import { formatDate, summarizeMovements } from "@/lib/utils";
import type { CreateMovementInput, Movement, UpdateMovementInput } from "@/types/movement";

const statusLabels = {
  active: "Activo",
  edited: "Editado",
  deleted: "Eliminado",
};

export function DailyBookContent() {
  const { role, userProfile } = useAuth();
  const {
    movements,
    loading,
    error,
    startDate,
    endDate,
    createMovement,
    updateMovement,
    deleteMovement,
    filterByDateRange,
  } = useMovements();
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Movement | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const canCreate = canCreateMovements(role);
  const canEdit = canEditMovements(role);
  const canDelete = canDeleteMovements(role);

  const sortedMovements = useMemo(
    () => [...movements].sort((a, b) => `${b.date}-${b.createdAt}`.localeCompare(`${a.date}-${a.createdAt}`)),
    [movements],
  );
  const totals = summarizeMovements(sortedMovements);

  async function handleCreate(data: CreateMovementInput) {
    setSuccessMessage(null);
    setActionError(null);
    await createMovement(data);
    setSuccessMessage("Movimiento guardado correctamente.");
  }

  async function handleFilter() {
    setSuccessMessage(null);
    setActionError(null);
    await filterByDateRange(localStartDate, localEndDate);
  }

  function handleExport(type: "pdf" | "excel") {
    setSuccessMessage(null);
    setActionError(null);

    if (sortedMovements.length === 0) {
      setActionError("No hay movimientos para exportar en este rango de fechas.");
      return;
    }

    setExporting(type);

    try {
      const params = {
        documentType: "daily-book" as const,
        movements: sortedMovements,
        startDate: localStartDate,
        endDate: localEndDate,
        clinicName: CLINIC_NAME,
        doctorName: DOCTOR_NAME,
        generatedBy: userProfile?.name ?? "Usuario del consultorio",
        totals,
      };

      if (type === "pdf") {
        exportMovementsToPDF(params);
        setSuccessMessage("El libro diario PDF se generó correctamente.");
      } else {
        exportMovementsToExcel(params);
        setSuccessMessage("El libro diario Excel se generó correctamente.");
      }
    } catch {
      setActionError("No se pudo generar el archivo. Intente nuevamente.");
    } finally {
      setExporting(null);
    }
  }

  async function handleSaveEdit(movementId: string, data: UpdateMovementInput) {
    setSavingEdit(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await updateMovement(movementId, data);
      setEditingMovement(null);
      setSuccessMessage("Movimiento actualizado correctamente.");
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "No se pudo actualizar el movimiento.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteCandidate) return;

    setActionError(null);
    setSuccessMessage(null);

    try {
      await deleteMovement(deleteCandidate.id);
      setDeleteCandidate(null);
      setSuccessMessage("Movimiento eliminado correctamente.");
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "No tienes permiso para eliminar movimientos.");
    }
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <MovementForm mode="general" disabled={!canCreate} successMessage={successMessage} errorMessage={error ?? actionError} onSubmit={handleCreate} />

        <Card>
          <CardHeader>
            <CardTitle>Filtros, totales y exportación</CardTitle>
            <CardDescription>Consulta movimientos reales por rango de fechas y descarga el libro diario.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <Input id="book-start-date" label="Fecha inicial" type="date" value={localStartDate} onChange={(event) => setLocalStartDate(event.target.value)} />
              <Input id="book-end-date" label="Fecha final" type="date" value={localEndDate} onChange={(event) => setLocalEndDate(event.target.value)} />
              <Button type="button" onClick={handleFilter} disabled={loading}>Filtrar</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-mint p-4 text-sm font-semibold text-mint-strong"><p>Total ingresos</p><p className="mt-2 text-xl">{formatCurrency(calculateIncomeTotal(movements))}</p></div>
              <div className="rounded-md bg-danger-soft p-4 text-sm font-semibold text-danger"><p>Total gastos</p><p className="mt-2 text-xl">{formatCurrency(calculateExpenseTotal(movements))}</p></div>
              <div className="rounded-md bg-primary-soft p-4 text-sm font-semibold text-primary"><p>Balance neto</p><p className="mt-2 text-xl">{formatCurrency(calculateBalance(movements))}</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="secondary" disabled={Boolean(exporting)} onClick={() => handleExport("pdf")}>
                {exporting === "pdf" ? "Generando..." : "Exportar PDF"}
              </Button>
              <Button type="button" variant="secondary" disabled={Boolean(exporting)} onClick={() => handleExport("excel")}>
                {exporting === "excel" ? "Generando..." : "Exportar Excel"}
              </Button>
            </div>
            {!canCreate ? <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Su perfil no tiene permiso para crear movimientos.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
          <CardDescription>Libro diario financiero del rango seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando movimientos...</p> : null}
          {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
          {actionError ? <p className="mb-4 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{actionError}</p> : null}
          {!loading && sortedMovements.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-soft bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No hay movimientos para este rango de fechas.</p>
              <p className="mt-1 text-sm text-slate-500">Registra un ingreso o gasto para verlo en el libro diario.</p>
            </div>
          ) : null}

          {sortedMovements.length > 0 ? (
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Tipo</Th>
                    <Th>Categoría</Th>
                    <Th>Descripción</Th>
                    <Th>Método</Th>
                    <Th className="text-right">Monto</Th>
                    <Th>Registrado por</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMovements.map((movement) => (
                    <tr key={movement.id}>
                      <Td>{formatDate(movement.date)}</Td>
                      <Td><Badge variant={movement.type === "income" ? "income" : "expense"}>{movement.type === "income" ? "Ingreso" : "Gasto"}</Badge></Td>
                      <Td>{movement.category}</Td>
                      <Td>{movement.description}</Td>
                      <Td>{paymentMethodLabels[movement.paymentMethod]}</Td>
                      <Td className="text-right font-semibold">{formatCurrency(movement.amount)}</Td>
                      <Td>{movement.createdByName ?? "Usuario"}</Td>
                      <Td><Badge variant={movement.status === "edited" ? "primary" : "neutral"}>{statusLabels[movement.status]}</Badge></Td>
                      <Td>
                        <div className="flex gap-2">
                          {canEdit ? <button type="button" className="font-semibold text-primary" onClick={() => setEditingMovement(movement)}>Editar</button> : null}
                          {canDelete ? <button type="button" className="font-semibold text-danger" onClick={() => setDeleteCandidate(movement)}>Eliminar</button> : <span className="text-slate-400">Sin permiso</span>}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : null}

          {sortedMovements.length > 0 ? (
            <div className="grid gap-3 lg:hidden">
              {sortedMovements.map((movement) => (
                <article key={movement.id} className="rounded-md border border-border-soft bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{movement.description}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(movement.date)} · {movement.category}</p>
                    </div>
                    <Badge variant={movement.type === "income" ? "income" : "expense"}>{movement.type === "income" ? "Ingreso" : "Gasto"}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-slate-500">Método</p><p className="font-medium text-slate-800">{paymentMethodLabels[movement.paymentMethod]}</p></div>
                    <div><p className="text-xs text-slate-500">Registrado por</p><p className="font-medium text-slate-800">{movement.createdByName ?? "Usuario"}</p></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-950">{formatCurrency(movement.amount)}</p>
                    <div className="flex gap-3 text-sm">
                      {canEdit ? <button type="button" className="font-semibold text-primary" onClick={() => setEditingMovement(movement)}>Editar</button> : null}
                      {canDelete ? <button type="button" className="font-semibold text-danger" onClick={() => setDeleteCandidate(movement)}>Eliminar</button> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <EditMovementDialog movement={editingMovement} open={Boolean(editingMovement)} saving={savingEdit} errorMessage={actionError} onClose={() => setEditingMovement(null)} onSave={handleSaveEdit} />

      {deleteCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-md rounded-lg border border-border-soft bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-950">Eliminar movimiento</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Esta acción marcará el movimiento como eliminado, sin borrarlo definitivamente del historial.</p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setDeleteCandidate(null)}>Cancelar</Button>
              <Button type="button" variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
