import type { Role } from "./role";

export type UserStatus = "active" | "pending" | "disabled";

export type UserProfile = {
  id: string;
  clinicId: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};
