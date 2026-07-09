"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { expenseCategories, incomeCategories, paymentMethodLabels, paymentMethods } from "@/lib/constants";
import { getTodayDate } from "@/lib/finance";
import type { CreateMovementInput, MovementType, PaymentMethod } from "@/types/movement";

type MovementFormProps = {
  mode: MovementType | "general";
  disabled?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  onSubmit: (data: CreateMovementInput) => Promise<void>;
};

const titles = {
  income: {
    title: "Registrar ingreso",
    description: "Agrega pagos recibidos por servicios del consultorio.",
    button: "Guardar ingreso",
  },
  expense: {
    title: "Registrar gasto",
    description: "Agrega salidas de dinero y pagos operativos.",
    button: "Guardar gasto",
  },
  general: {
    title: "Registrar movimiento general",
    description: "Agrega ingresos o gastos directamente al libro diario.",
    button: "Guardar registro",
  },
};

const movementTypeOptions = [
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Gasto" },
];

const paymentOptions = paymentMethods.map((method) => ({
  value: method,
  label: paymentMethodLabels[method],
}));

export function MovementForm({ mode, disabled = false, successMessage, errorMessage, onSubmit }: MovementFormProps) {
  const labels = titles[mode];
  const initialType = mode === "expense" ? "expense" : "income";
  const [type, setType] = useState<MovementType>(initialType);
  const [date, setDate] = useState(getTodayDate());
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => (type === "income" ? incomeCategories : expenseCategories), [type]);
  const categoryOptions = useMemo(() => categories.map((currentCategory) => ({ value: currentCategory, label: currentCategory })), [categories]);

  useEffect(() => {
    setCategory(categories[0] ?? "");
  }, [categories]);

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

    setSubmitting(true);

    try {
      await onSubmit({
        type,
        category,
        paymentMethod,
        amount: parsedAmount,
        description: description.trim(),
        notes: notes.trim() || undefined,
        date,
      });
      setAmount("");
      setDescription("");
      setNotes("");
      setDate(getTodayDate());
    } catch (submitError) {
      setLocalError(submitError instanceof Error ? submitError.message : "No se pudo guardar el movimiento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input id={`${mode}-date`} label="Fecha" type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={disabled || submitting} />
            {mode === "general" ? (
              <Select id="movement-type" label="Tipo de movimiento" options={movementTypeOptions} value={type} onChange={(event) => setType(event.target.value as MovementType)} disabled={disabled || submitting} />
            ) : null}
            <Select id={`${mode}-category`} label="Categoría" options={categoryOptions} value={category} onChange={(event) => setCategory(event.target.value)} disabled={disabled || submitting} />
            <Select id={`${mode}-payment`} label="Método de pago" options={paymentOptions} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={disabled || submitting} />
            <Input id={`${mode}-amount`} label="Monto" type="number" min="0" step="0.01" placeholder="L 0.00" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={disabled || submitting} />
            <Input id={`${mode}-description`} label="Descripción" placeholder="Detalle breve del movimiento" value={description} onChange={(event) => setDescription(event.target.value)} disabled={disabled || submitting} />
          </div>
          <Textarea id={`${mode}-notes`} label="Observaciones" placeholder="Notas internas opcionales" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={disabled || submitting} />
          {localError || errorMessage ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{localError ?? errorMessage}</p> : null}
          {successMessage ? <p className="rounded-md bg-mint p-3 text-sm font-medium text-mint-strong">{successMessage}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={disabled || submitting}>{submitting ? "Guardando..." : labels.button}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
