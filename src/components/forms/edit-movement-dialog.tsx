"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { expenseCategories, incomeCategories, paymentMethodLabels, paymentMethods } from "@/lib/constants";
import type { Movement, PaymentMethod, UpdateMovementInput } from "@/types/movement";

type EditMovementDialogProps = {
  movement: Movement | null;
  open: boolean;
  saving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (movementId: string, data: UpdateMovementInput) => Promise<void>;
};

const paymentOptions = paymentMethods.map((method) => ({
  value: method,
  label: paymentMethodLabels[method],
}));

export function EditMovementDialog({ movement, open, saving = false, errorMessage, onClose, onSave }: EditMovementDialogProps) {
  const categories = useMemo(() => {
    if (!movement) return incomeCategories;
    return movement.type === "income" ? incomeCategories : expenseCategories;
  }, [movement]);
  const categoryOptions = useMemo(() => categories.map((category) => ({ value: category, label: category })), [categories]);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!movement) return;

    setDate(movement.date);
    setCategory(movement.category);
    setPaymentMethod(movement.paymentMethod);
    setAmount(String(movement.amount));
    setDescription(movement.description);
    setNotes(movement.notes ?? "");
    setLocalError(null);
  }, [movement]);

  if (!open || !movement) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const parsedAmount = Number(amount);

    if (!date || !category || !paymentMethod || !description.trim()) {
      setLocalError("Complete fecha, categoría, método de pago, monto y descripción.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLocalError("El monto debe ser mayor que cero.");
      return;
    }

    await onSave(movement.id, {
      date,
      category,
      paymentMethod,
      amount: parsedAmount,
      description: description.trim(),
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-lg border border-border-soft bg-white shadow-xl">
        <div className="border-b border-border-soft px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">Editar movimiento</h2>
          <p className="mt-1 text-sm text-slate-500">Actualiza datos financieros sin modificar el usuario que registró el movimiento.</p>
        </div>
        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input id="edit-date" label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={saving} />
            <Select id="edit-category" label="Categoría" options={categoryOptions} value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving} />
            <Select id="edit-payment" label="Método de pago" options={paymentOptions} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={saving} />
            <Input id="edit-amount" label="Monto" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={saving} />
            <Input id="edit-description" label="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} disabled={saving} />
          </div>
          <Textarea id="edit-notes" label="Observaciones" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={saving} />
          {localError || errorMessage ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{localError ?? errorMessage}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
