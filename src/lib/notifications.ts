import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { CLINIC_ID } from "@/lib/constants";
import { formatCurrency } from "@/lib/finance";
import { db } from "@/lib/firebase";
import type { MovementType } from "@/types/movement";
import type { AppNotification, NotificationAudience, NotificationSeverity, NotificationType } from "@/types/notification";
import type { Role } from "@/types/role";
import type { UserProfile } from "@/types/user";

const notificationsCollection = collection(db, "notifications");
const responsibleRoles: Role[] = ["technical_owner", "business_owner"];

type CreateNotificationInput = {
  clinicId: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  audience: NotificationAudience;
  visibleToRoles?: Role[];
  visibleToUserIds?: string[];
  recipientUserId?: string;
  actorUserId?: string;
  actorRole?: Role;
  recipientUserRole?: Role;
  relatedUserId?: string;
  relatedUserRole?: Role;
  relatedMovementId?: string;
};

function timestampToString(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return typeof value === "string" ? value : new Date().toISOString();
}

function normalizeRoleList(value: unknown): Role[] {
  if (!Array.isArray(value)) return [];
  return value.filter((role): role is Role => role === "technical_owner" || role === "business_owner" || role === "admin");
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeNotification(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id: typeof data.id === "string" ? data.id : id,
    clinicId: typeof data.clinicId === "string" ? data.clinicId : CLINIC_ID,
    title: typeof data.title === "string" ? data.title : "Notificación",
    message: typeof data.message === "string" ? data.message : "Tienes una actualización en el sistema.",
    type: normalizeNotificationType(data.type),
    severity: normalizeNotificationSeverity(data.severity),
    audience: normalizeNotificationAudience(data.audience),
    recipientUserId: typeof data.recipientUserId === "string" ? data.recipientUserId : undefined,
    actorUserId: typeof data.actorUserId === "string" ? data.actorUserId : undefined,
    actorRole: normalizeOptionalRole(data.actorRole),
    recipientUserRole: normalizeOptionalRole(data.recipientUserRole),
    relatedUserId: typeof data.relatedUserId === "string" ? data.relatedUserId : undefined,
    relatedUserRole: normalizeOptionalRole(data.relatedUserRole),
    relatedMovementId: typeof data.relatedMovementId === "string" ? data.relatedMovementId : undefined,
    visibleToRoles: normalizeRoleList(data.visibleToRoles),
    visibleToUserIds: normalizeStringList(data.visibleToUserIds),
    readBy: normalizeStringList(data.readBy),
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
  };
}

function normalizeOptionalRole(value: unknown) {
  return value === "technical_owner" || value === "business_owner" || value === "admin" ? value : undefined;
}

function normalizeNotificationType(value: unknown): NotificationType {
  if (
    value === "access_request" ||
    value === "user_approved" ||
    value === "income_created" ||
    value === "expense_created" ||
    value === "movement_deleted" ||
    value === "daily_review" ||
    value === "system"
  ) {
    return value;
  }

  return "system";
}

function normalizeNotificationSeverity(value: unknown): NotificationSeverity {
  if (value === "success" || value === "warning" || value === "danger" || value === "info") {
    return value;
  }

  return "info";
}

function normalizeNotificationAudience(value: unknown): NotificationAudience {
  if (
    value === "technical_owner" ||
    value === "business_owner" ||
    value === "admin" ||
    value === "user" ||
    value === "responsibles" ||
    value === "all"
  ) {
    return value;
  }

  return "all";
}

function canViewNotification(notification: AppNotification, userProfile: UserProfile) {
  if (userProfile.status !== "active" || notification.clinicId !== userProfile.clinicId) return false;
  if (userProfile.role === "technical_owner") return true;
  if (notification.recipientUserId === userProfile.id) return true;
  return notification.visibleToRoles.includes(userProfile.role);
}

async function createNotification(input: CreateNotificationInput) {
  const notificationRef = doc(notificationsCollection);

  await setDoc(notificationRef, {
    id: notificationRef.id,
    clinicId: input.clinicId,
    title: input.title,
    message: input.message,
    type: input.type,
    severity: input.severity,
    audience: input.audience,
    recipientUserId: input.recipientUserId ?? "",
    actorUserId: input.actorUserId ?? "",
    actorRole: input.actorRole ?? "",
    recipientUserRole: input.recipientUserRole ?? "",
    relatedUserId: input.relatedUserId ?? "",
    relatedUserRole: input.relatedUserRole ?? "",
    relatedMovementId: input.relatedMovementId ?? "",
    visibleToRoles: input.visibleToRoles ?? [],
    visibleToUserIds: input.visibleToUserIds ?? [],
    readBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return notificationRef.id;
}

export async function createAccessRequestNotification(userProfile: UserProfile) {
  return createNotification({
    clinicId: userProfile.clinicId,
    title: "Nueva solicitud de acceso",
    message: "Un usuario solicitó acceso al sistema.",
    type: "access_request",
    severity: "info",
    audience: "responsibles",
    actorUserId: userProfile.id,
    actorRole: userProfile.role,
    relatedUserId: userProfile.id,
    relatedUserRole: userProfile.role,
    visibleToRoles: responsibleRoles,
  });
}

export async function createUserApprovedNotification(targetUser: UserProfile) {
  return createNotification({
    clinicId: targetUser.clinicId,
    title: "Acceso aprobado",
    message: "Tu cuenta ya fue aprobada. Ya puedes usar el sistema.",
    type: "user_approved",
    severity: "success",
    audience: "user",
    recipientUserId: targetUser.id,
    recipientUserRole: targetUser.role,

    relatedUserId: targetUser.id,
    relatedUserRole: targetUser.role,
    visibleToUserIds: [targetUser.id],
  });
}

export async function createMovementCreatedNotification({
  clinicId,
  movementId,
  type,
  amount,
}: {
  clinicId: string;
  movementId: string;
  type: MovementType;
  amount: number;
}) {
  const isIncome = type === "income";

  return createNotification({
    clinicId,
    title: isIncome ? "Ingreso registrado" : "Gasto registrado",
    message: `Se registró un nuevo ${isIncome ? "ingreso" : "gasto"} por ${formatCurrency(amount)}.`,
    type: isIncome ? "income_created" : "expense_created",
    severity: isIncome ? "success" : "warning",
    audience: "responsibles",
    relatedMovementId: movementId,
    visibleToRoles: responsibleRoles,
  });
}

export async function createMovementDeletedNotification(movementId: string, actorUser: UserProfile) {
  return createNotification({
    clinicId: actorUser.clinicId,
    title: "Movimiento eliminado",
    message: "Un movimiento fue retirado del listado activo.",
    type: "movement_deleted",
    severity: "danger",
    audience: "responsibles",
    relatedMovementId: movementId,
    visibleToRoles: responsibleRoles,
  });
}

export async function getNotificationsForCurrentUser(userProfile: UserProfile, limitNumber = 20) {
  if (userProfile.status !== "active") return [];

  const queries = userProfile.role === "technical_owner"
    ? [query(notificationsCollection, where("clinicId", "==", userProfile.clinicId))]
    : [
        query(
          notificationsCollection,
          where("clinicId", "==", userProfile.clinicId),
          where("visibleToRoles", "array-contains", userProfile.role),
        ),
        query(
          notificationsCollection,
          where("clinicId", "==", userProfile.clinicId),
          where("visibleToUserIds", "array-contains", userProfile.id),
        ),
      ];

  const snapshots = await Promise.all(queries.map((notificationsQuery) => getDocs(notificationsQuery)));
  const byId = new Map<string, AppNotification>();

  for (const snapshot of snapshots) {
    for (const notificationDoc of snapshot.docs) {
      const notification = normalizeNotification(notificationDoc.id, notificationDoc.data());
      if (canViewNotification(notification, userProfile)) {
        byId.set(notification.id, notification);
      }
    }
  }

  return [...byId.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limitNumber);
}

export function getUnreadNotificationsCount(notifications: AppNotification[], userId: string) {
  return notifications.filter((notification) => !notification.readBy.includes(userId)).length;
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  await updateDoc(doc(db, "notifications", notificationId), {
    readBy: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function markAllNotificationsAsRead(notifications: AppNotification[], userId: string) {
  const unreadNotifications = notifications.filter((notification) => !notification.readBy.includes(userId));
  await Promise.all(unreadNotifications.map((notification) => markNotificationAsRead(notification.id, userId)));
}
