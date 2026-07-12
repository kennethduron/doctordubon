import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { CLINIC_ID } from "@/lib/constants";
import { auth, db, getFirebaseErrorLogDetails } from "@/lib/firebase";
import { createUserApprovedNotification, createUserDisabledNotification, createUserEnabledNotification } from "@/lib/notifications";
import { canApproveUsers, canAssignRoles, canDisableUsers, canEnableUsers, isCriticalRole } from "@/lib/roles";
import type { Role } from "@/types/role";
import type { UserProfile, UserStatus } from "@/types/user";

const usersCollection = collection(db, "users");

function timestampToString(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return typeof value === "string" ? value : new Date().toISOString();
}

function normalizeRole(value: unknown): Role {
  if (value === "technical_owner" || value === "business_owner" || value === "admin") {
    return value;
  }

  return "admin";
}

function normalizeStatus(value: unknown): UserStatus {
  if (value === "active" || value === "pending" || value === "disabled") {
    return value;
  }

  return "pending";
}

function fallbackUsername(data: Record<string, unknown>) {
  const emailPrefix = typeof data.email === "string" ? data.email.split("@")[0] : "";
  const cleanPrefix = emailPrefix.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 30);
  return cleanPrefix.length >= 3 ? cleanPrefix : "no-registrado";
}

function normalizeUser(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id: typeof data.id === "string" ? data.id : id,
    clinicId: typeof data.clinicId === "string" ? data.clinicId : CLINIC_ID,
    name: typeof data.name === "string" ? data.name : "Usuario del consultorio",
    username: typeof data.username === "string" && data.username.trim()
      ? data.username.trim().toLowerCase()
      : fallbackUsername(data),
    email: typeof data.email === "string" ? data.email : "",
    role: normalizeRole(data.role),
    status: normalizeStatus(data.status),
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
  };
}

async function getUserProfile(userId: string) {
  const snapshot = await getDoc(doc(db, "users", userId));

  if (!snapshot.exists()) {
    throw new Error("No se encontró el usuario seleccionado.");
  }

  return normalizeUser(snapshot.id, snapshot.data());
}

function assertSameClinic(targetUser: UserProfile, currentUserProfile: UserProfile) {
  if (targetUser.clinicId !== currentUserProfile.clinicId) {
    throw new Error("No tienes permiso para gestionar este usuario.");
  }
}

function assertCanApprove(targetUser: UserProfile, currentUserProfile: UserProfile) {
  assertSameClinic(targetUser, currentUserProfile);

  if (!canApproveUsers(currentUserProfile.role)) {
    throw new Error("No tienes permiso para aprobar usuarios.");
  }

  if (currentUserProfile.role === "business_owner" && targetUser.role !== "admin") {
    throw new Error("No tienes permiso para gestionar esta cuenta.");
  }
}

function assertCanDisable(targetUser: UserProfile, currentUserProfile: UserProfile) {
  assertSameClinic(targetUser, currentUserProfile);

  if (!canDisableUsers(currentUserProfile.role)) {
    throw new Error("No tienes permiso para deshabilitar usuarios.");
  }

  if (currentUserProfile.role === "business_owner" && targetUser.role !== "admin") {
    throw new Error("No tienes permiso para gestionar esta cuenta.");
  }
}
function assertCanEnable(targetUser: UserProfile, currentUserProfile: UserProfile) {
  assertSameClinic(targetUser, currentUserProfile);

  if (!canEnableUsers(currentUserProfile.role)) {
    throw new Error("No tienes permiso para habilitar usuarios.");
  }

  if (currentUserProfile.role === "business_owner" && targetUser.role !== "admin") {
    throw new Error("No tienes permiso para gestionar esta cuenta.");
  }
}

function assertCanChangeRole(targetUser: UserProfile, nextRole: Role, currentUserProfile: UserProfile) {
  assertSameClinic(targetUser, currentUserProfile);

  if (!canAssignRoles(currentUserProfile.role)) {
    throw new Error("No tienes permiso para cambiar roles.");
  }

  if (targetUser.id === currentUserProfile.id && isCriticalRole(targetUser.role) && nextRole !== "technical_owner") {
    throw new Error("Esta cuenta principal debe conservar su acceso completo.");
  }
}

async function getUsersByRole(clinicId: string, role: Role) {
  const usersQuery = query(usersCollection, where("clinicId", "==", clinicId), where("role", "==", role));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((userDoc) => normalizeUser(userDoc.id, userDoc.data()));
}

export async function getUsersByClinic(clinicId: string, viewerProfile?: UserProfile | null) {
  if (!viewerProfile || viewerProfile.status !== "active" || viewerProfile.clinicId !== clinicId) {
    return [];
  }

  if (viewerProfile.role === "business_owner") {
    const admins = await getUsersByRole(clinicId, "admin");
    return [viewerProfile, ...admins.filter((user) => user.id !== viewerProfile.id)]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  if (viewerProfile.role !== "technical_owner") {
    return [];
  }

  const usersQuery = query(usersCollection, where("clinicId", "==", clinicId));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs
    .map((userDoc) => normalizeUser(userDoc.id, userDoc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPendingUsers(clinicId: string, viewerRole?: Role | null) {
  const usersQuery = viewerRole === "business_owner"
    ? query(usersCollection, where("clinicId", "==", clinicId), where("status", "==", "pending"), where("role", "==", "admin"))
    : query(usersCollection, where("clinicId", "==", clinicId), where("status", "==", "pending"));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs
    .map((userDoc) => normalizeUser(userDoc.id, userDoc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function approveUser(userId: string, currentUserProfile: UserProfile) {
  const targetUser = await getUserProfile(userId);
  assertCanApprove(targetUser, currentUserProfile);

  await updateDoc(doc(db, "users", userId), {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  try {
    await createUserApprovedNotification({ ...targetUser, status: "active" });
  } catch (error) {
    console.error("Notification creation error:", getFirebaseErrorLogDetails(error));
  }
}

export async function disableUser(userId: string, currentUserProfile: UserProfile) {
  const targetUser = await getUserProfile(userId);
  assertCanDisable(targetUser, currentUserProfile);

  if (targetUser.id === currentUserProfile.id && isCriticalRole(targetUser.role)) {
    throw new Error("No puedes deshabilitar tu propia cuenta principal.");
  }

  await updateDoc(doc(db, "users", userId), {
    status: "disabled",
    updatedAt: serverTimestamp(),
  });

  try {
    await createUserDisabledNotification({ ...targetUser, status: "disabled" });
  } catch (error) {
    console.error("Notification creation error:", getFirebaseErrorLogDetails(error));
  }
}

export async function enableUser(userId: string, currentUserProfile: UserProfile) {
  const targetUser = await getUserProfile(userId);
  assertCanEnable(targetUser, currentUserProfile);

  await updateDoc(doc(db, "users", userId), {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  try {
    await createUserEnabledNotification({ ...targetUser, status: "active" });
  } catch (error) {
    console.error("Notification creation error:", getFirebaseErrorLogDetails(error));
  }
}

export async function updateUserRole(userId: string, role: Role, currentUserProfile: UserProfile) {
  const targetUser = await getUserProfile(userId);
  assertCanChangeRole(targetUser, role, currentUserProfile);

  await updateDoc(doc(db, "users", userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

type DeleteUserResponse = {
  deleted?: boolean;
  code?: string;
};

export async function deleteUserSafely(userId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  }

  let response: Response;
  let payload: DeleteUserResponse;

  try {
    const idToken = await currentUser.getIdToken();
    response = await fetch("/api/users/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + idToken,
      },
      body: JSON.stringify({ targetUserId: userId }),
    });
    payload = (await response.json().catch(() => ({}))) as DeleteUserResponse;
  } catch (error) {
    console.error("Safe user deletion client error:", getFirebaseErrorLogDetails(error));
    throw new Error("No se pudo eliminar la cuenta en este momento. Intenta nuevamente.");
  }

  if (response.ok && payload.deleted) {
    return;
  }

  if (payload.code === "users/has-history") {
    throw new Error("Este usuario tiene historial en el sistema. Puedes deshabilitarlo, pero no eliminarlo.");
  }

  if (payload.code === "users/not-authorized") {
    throw new Error("No tienes permiso para eliminar este usuario.");
  }

  if (payload.code === "users/delete-unavailable") {
    throw new Error("No se pudo eliminar la cuenta en este momento. Contacta al encargado del sistema.");
  }

  throw new Error("No se pudo eliminar el usuario. Intenta nuevamente.");
}
