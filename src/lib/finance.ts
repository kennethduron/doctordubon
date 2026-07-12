import type { Movement } from "@/types/movement";

export type DatePreset = "today" | "week" | "month" | "year" | "custom";

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

export function getWeekDateRange(date = new Date()) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function getYearDateRange(date = new Date()) {
  const year = date.getFullYear();

  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function getDatePresetRange(preset: DatePreset) {
  if (preset === "today") {
    const today = getTodayDate();
    return { startDate: today, endDate: today };
  }

  if (preset === "week") return getWeekDateRange();
  if (preset === "year") return getYearDateRange();
  return getMonthDateRange();
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatMonthYear(date = new Date()) {
  return new Intl.DateTimeFormat("es-HN", { month: "long", year: "numeric" }).format(date);
}

export function formatDateLabel(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("es-HN", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
}

export function describeDateRange(startDate: string, endDate: string) {
  if (startDate === endDate) return formatDateLabel(startDate);
  return `${formatDateLabel(startDate)} al ${formatDateLabel(endDate)}`;
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
