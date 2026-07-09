import type { PaymentMethod } from "@/types/movement";
import type { PermissionNote } from "@/types/role";

export const CLINIC_ID = "clinic_dr_oscar_dubon";
export const CLINIC_NAME = process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Consultorio Dr. Oscar Dubon";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Centro Financiero del Consultorio";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctordubon.vercel.app";
export const APP_DESCRIPTION = "Control diario de ingresos y gastos del consultorio médico.";
export const CURRENCY = "HNL";

export const incomeCategories = [
  "Consulta médica",
  "Control médico",
  "Procedimiento médico",
  "Certificado médico",
  "Examen médico",
  "Otro ingreso",
];

export const expenseCategories = [
  "Insumos médicos",
  "Medicamentos",
  "Servicios públicos",
  "Renta",
  "Mantenimiento",
  "Equipo médico",
  "Transporte",
  "Pago de personal",
  "Otro gasto",
];

export const paymentMethods: PaymentMethod[] = ["efectivo", "transferencia", "tarjeta", "otro"];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

export const roleRules: PermissionNote[] = [
  {
    role: "technical_owner",
    title: "Acceso total",
    description: "Puede administrar configuraciones técnicas críticas, finanzas, usuarios y roles.",
  },
  {
    role: "business_owner",
    title: "Gestión operativa",
    description:
      "Administra el consultorio, finanzas y usuarios normales. No puede eliminar ni quitar permisos al Técnico operativo.",
  },
  {
    role: "admin",
    title: "Registro y consulta",
    description: "Registra ingresos, gastos y consulta reportes. No puede asignar roles.",
  },
];
