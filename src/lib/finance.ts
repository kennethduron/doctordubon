import type { Movement } from "@/types/movement";

export function formatCurrency(amount: number) {
  return `L ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function calculateIncomeTotal(movements: Movement[]) {
  return filterActiveMovements(movements)
    .filter((movement) => movement.type === "income")
    .reduce((total, movement) => total + movement.amount, 0);
}

export function calculateExpenseTotal(movements: Movement[]) {
  return filterActiveMovements(movements)
    .filter((movement) => movement.type === "expense")
    .reduce((total, movement) => total + movement.amount, 0);
}

export function calculateBalance(movements: Movement[]) {
  return calculateIncomeTotal(movements) - calculateExpenseTotal(movements);
}

export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMonthDateRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function filterActiveMovements(movements: Movement[]) {
  return movements.filter((movement) => movement.status !== "deleted");
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
