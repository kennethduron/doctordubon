import type { Movement } from "@/types/movement";
import { formatCurrency as formatFinanceCurrency } from "./finance";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return formatFinanceCurrency(value);
}

export function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value);

  return new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function summarizeMovements(movements: Movement[]) {
  const income = movements
    .filter((movement) => movement.type === "income" && movement.status !== "deleted")
    .reduce((total, movement) => total + movement.amount, 0);
  const expense = movements
    .filter((movement) => movement.type === "expense" && movement.status !== "deleted")
    .reduce((total, movement) => total + movement.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
    count: movements.filter((movement) => movement.status !== "deleted").length,
  };
}
