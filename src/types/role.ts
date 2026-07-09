export type Role = "technical_owner" | "business_owner" | "admin";

export type PermissionNote = {
  role: Role;
  title: string;
  description: string;
};
