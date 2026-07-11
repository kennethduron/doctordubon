import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { APP_NAME, paymentMethodLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/finance";
import { formatDate } from "@/lib/utils";
import type { Movement } from "@/types/movement";

type ExportTotals = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

export type ExportMovementsParams = {
  documentType: "report" | "daily-book";
  movements: Movement[];
  startDate: string;
  endDate: string;
  clinicName: string;
  doctorName: string;
  generatedBy: string;
  totals: ExportTotals;
};

function getGeneratedDate() {
  return new Intl.DateTimeFormat("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

function getReportFileName(
  extension: "pdf" | "xlsx",
  documentType: ExportMovementsParams["documentType"],
  startDate: string,
  endDate: string,
) {
  const prefix = documentType === "daily-book" ? "libro-diario" : "reporte-financiero";
  const generatedTime = new Date().toTimeString().slice(0, 8).replaceAll(":", "-");
  return `${prefix}-dr-oscar-dubon-${startDate}-a-${endDate}-${generatedTime}.${extension}`;
}

function getTypeLabel(movement: Movement) {
  return movement.type === "income" ? "Ingreso" : "Gasto";
}

function getStatusLabel(movement: Movement) {
  if (movement.status === "edited") return "Editado";
  if (movement.status === "deleted") return "Eliminado";
  return "Activo";
}

function toMoneyValue(amount: number) {
  return Number(amount.toFixed(2));
}

export function exportMovementsToPDF({
  documentType,
  movements,
  startDate,
  endDate,
  clinicName,
  doctorName,
  generatedBy,
  totals,
}: ExportMovementsParams) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const generatedDate = getGeneratedDate();

  doc.setTextColor(15, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(APP_NAME, 14, 16);

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.text(documentType === "daily-book" ? "Libro diario" : "Reporte financiero", 14, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Consultorio: ${clinicName}`, 14, 34);
  doc.text(`Doctor: ${doctorName}`, 14, 40);
  doc.text(`Rango de fechas: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 46);
  doc.text(`Fecha de generación: ${generatedDate}`, 14, 52);
  doc.text(`Generado por: ${generatedBy}`, 14, 58);

  const summaryRows = [
    ["Total ingresos", formatCurrency(totals.income)],
    ["Total gastos", formatCurrency(totals.expense)],
    ["Balance neto", formatCurrency(totals.balance)],
    ["Cantidad de movimientos", String(totals.count)],
  ];

  autoTable(doc, {
    startY: 30,
    margin: { left: 180, right: 14 },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
    bodyStyles: { textColor: [31, 41, 55] },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [230, 241, 251], textColor: [15, 58, 95] },
      1: { halign: "right" },
    },
    body: summaryRows,
  });

  autoTable(doc, {
    startY: 70,
    head: [["Fecha", "Tipo", "Categoría", "Descripción", "Método de pago", "Observaciones", "Monto"]],
    body: movements.map((movement) => [
      formatDate(movement.date),
      getTypeLabel(movement),
      movement.category,
      movement.description,
      paymentMethodLabels[movement.paymentMethod],
      movement.notes || "—",
      formatCurrency(movement.amount),
    ]),
    theme: "striped",
    headStyles: { fillColor: [15, 58, 95], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 22 },
      2: { cellWidth: 36 },
      3: { cellWidth: 55 },
      4: { cellWidth: 35 },
      5: { cellWidth: 55 },
      6: { cellWidth: 25, halign: "right" },
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Página ${doc.getCurrentPageInfo().pageNumber} de ${pageCount}`, 263, 202);
    },
  });

  doc.save(getReportFileName("pdf", documentType, startDate, endDate));
}

export function exportMovementsToExcel({
  documentType,
  movements,
  startDate,
  endDate,
  clinicName,
  doctorName,
  generatedBy,
  totals,
}: ExportMovementsParams) {
  const generatedDate = getGeneratedDate();
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    [APP_NAME],
    [documentType === "daily-book" ? "Libro diario" : "Reporte financiero"],
    [],
    ["Consultorio", clinicName],
    ["Doctor", doctorName],
    ["Rango de fechas", `${formatDate(startDate)} - ${formatDate(endDate)}`],
    ["Total ingresos", toMoneyValue(totals.income)],
    ["Total gastos", toMoneyValue(totals.expense)],
    ["Balance neto", toMoneyValue(totals.balance)],
    ["Cantidad de movimientos", totals.count],
    ["Fecha de generación", generatedDate],
    ["Generado por", generatedBy],
  ]);

  summarySheet["!cols"] = [{ wch: 28 }, { wch: 36 }];
  ["B7", "B8", "B9"].forEach((cell) => {
    if (summarySheet[cell]) summarySheet[cell].z = `"L" #,##0.00`;
  });

  const movementRows = movements.map((movement) => ({
    "Fecha": formatDate(movement.date),
    "Tipo": getTypeLabel(movement),
    "Categoría": movement.category,
    "Descripción": movement.description,
    "Método de pago": paymentMethodLabels[movement.paymentMethod],
    "Observaciones": movement.notes ?? "",
    "Monto": toMoneyValue(movement.amount),
    "Registrado por": movement.createdByName ?? "Usuario",
    "Estado": getStatusLabel(movement),
  }));

  const movementsSheet = XLSX.utils.json_to_sheet(movementRows);
  movementsSheet["!cols"] = [
    { wch: 16 },
    { wch: 12 },
    { wch: 24 },
    { wch: 44 },
    { wch: 18 },
    { wch: 40 },
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
  ];

  movements.forEach((_, index) => {
    const cell = movementsSheet[`G${index + 2}`];
    if (cell) cell.z = `"L" #,##0.00`;
  });

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
  XLSX.utils.book_append_sheet(workbook, movementsSheet, "Movimientos");
  XLSX.writeFile(workbook, getReportFileName("xlsx", documentType, startDate, endDate), { bookType: "xlsx", compression: true });
}
