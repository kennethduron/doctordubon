import type { Role } from "./role";

export type NotificationType =
  | "access_request"
  | "user_approved"
  | "income_created"
  | "expense_created"
  | "movement_deleted"
  | "daily_review"
  | "system";

export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export type NotificationAudience = "technical_owner" | "business_owner" | "admin" | "user" | "responsibles" | "all";

export type AppNotification = {
  id: string;
  clinicId: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  audience: NotificationAudience;
  recipientUserId?: string;
  actorUserId?: string;
  actorRole?: Role;
  recipientUserRole?: Role;
  relatedUserId?: string;
  relatedUserRole?: Role;
  relatedMovementId?: string;
  visibleToRoles: Role[];
  visibleToUserIds: string[];
  readBy: string[];
  createdAt: string;
  updatedAt: string;
};
