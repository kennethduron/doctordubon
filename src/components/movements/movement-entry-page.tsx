"use client";

import { useState } from "react";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { ExpenseForm } from "@/components/forms/expense-form";
import { IncomeForm } from "@/components/forms/income-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useMovements } from "@/hooks/use-movements";
import { expenseCategories, incomeCategories } from "@/lib/constants";
import { getMonthDateRange } from "@/lib/finance";
import { canCreateMovements } from "@/lib/roles";
import type { CreateMovementInput, MovementType } from "@/types/movement";

type MovementEntryPageProps = {
  type: MovementType;
};

export function MovementEntryPage({ type }: MovementEntryPageProps) {
  const { role } = useAuth();
  const range = getMonthDateRange();
  const { movements, loading, error, createMovement } = useMovements({
    initialStartDate: range.startDate,
    initialEndDate: range.endDate,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const canCreate = canCreateMovements(role);
  const categories = type === "income" ? incomeCategories : expenseCategories;
  const filteredMovements = movements.filter((movement) => movement.type === type).slice(0, 6);

  async function handleSubmit(data: CreateMovementInput) {
    setSuccessMessage(null);
    await createMovement({ ...data, type });
    setSuccessMessage(type === "income" ? "Ingreso guardado correctamente." : "Gasto guardado correctamente.");
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {type === "income" ? (
          <IncomeForm disabled={!canCreate} successMessage={successMessage} errorMessage={error} onSubmit={handleSubmit} />
        ) : (
          <ExpenseForm disabled={!canCreate} successMessage={successMessage} errorMessage={error} onSubmit={handleSubmit} />
        )}
        <Card>
          <CardHeader>
            <CardTitle>{type === "income" ? "Categorías de ingresos" : "Categorías de gastos"}</CardTitle>
            <CardDescription>Catálogo financiero del consultorio.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {!canCreate ? (
              <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">
                Su perfil no tiene permiso para crear movimientos.
              </p>
            ) : null}
            {categories.map((category) => (
              <div
                key={category}
                className={type === "income" ? "rounded-md bg-mint px-3 py-2 text-sm font-medium text-mint-strong" : "rounded-md bg-danger-soft px-3 py-2 text-sm font-medium text-danger"}
              >
                {category}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        {loading ? (
          <Card><CardContent><p className="text-sm text-slate-500">Cargando movimientos...</p></CardContent></Card>
        ) : (
          <RecentMovements movements={filteredMovements} />
        )}
      </div>
    </>
  );
}
