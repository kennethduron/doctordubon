import type { Role } from "@/types/role";

export const roleLabels: Record<Role, string> = {
  technical_owner: "Técnico operativo",
  business_owner: "Dueño operativo",
  admin: "Administrador",
};

export function canManageUsers(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner";
}

export function canApproveUsers(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner";
}

export function canDisableUsers(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner";
}

export function canEnableUsers(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner";
}

export function canAssignRoles(role?: Role | null) {
  return role === "technical_owner";
}

export function isCriticalRole(role?: Role | null) {
  return role === "technical_owner";
}

export function canAccessTechnicalSettings(role?: Role | null) {
  return role === "technical_owner";
}

export function canCreateMovements(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner" || role === "admin";
}

export function canEditMovements(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner";
}

export function canDeleteMovements(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner";
}

export function canViewReports(role?: Role | null) {
  return role === "technical_owner" || role === "business_owner" || role === "admin";
}