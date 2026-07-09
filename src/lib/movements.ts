import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { CLINIC_ID } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { getMonthDateRange, getTodayDate } from "@/lib/finance";
import type { CreateMovementInput, Movement, PaymentMethod, UpdateMovementInput } from "@/types/movement";
import type { UserProfile } from "@/types/user";

const movementsCollection = collection(db, "movements");

function timestampToString(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return typeof value === "string" ? value : new Date().toISOString();
}

function normalizePaymentMethod(value: unknown): PaymentMethod {
  if (value === "efectivo" || value === "transferencia" || value === "tarjeta" || value === "otro") {
    return value;
  }

  return "otro";
}

function normalizeMovement(id: string, data: Record<string, unknown>): Movement {
  return {
    id: typeof data.id === "string" ? data.id : id,
    clinicId: typeof data.clinicId === "string" ? data.clinicId : CLINIC_ID,
    type: data.type === "expense" ? "expense" : "income",
    category: typeof data.category === "string" ? data.category : "Sin categoría",
    paymentMethod: normalizePaymentMethod(data.paymentMethod),
    amount: typeof data.amount === "number" ? data.amount : Number(data.amount ?? 0),
    description: typeof data.description === "string" ? data.description : "Sin descripción",
    notes: typeof data.notes === "string" ? data.notes : undefined,
    date: typeof data.date === "string" ? data.date : getTodayDate(),
    status: data.status === "edited" || data.status === "deleted" ? data.status : "active",
    createdBy: typeof data.createdBy === "string" ? data.createdBy : "",
    createdByName: typeof data.createdByName === "string" ? data.createdByName : undefined,
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
    deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined,
    deletedBy: typeof data.deletedBy === "string" ? data.deletedBy : undefined,
  };
}

export async function createMovement(data: CreateMovementInput, userProfile: UserProfile) {
  const movementRef = doc(movementsCollection);

  await setDoc(movementRef, {
    id: movementRef.id,
    clinicId: userProfile.clinicId,
    type: data.type,
    category: data.category,
    paymentMethod: data.paymentMethod,
    amount: data.amount,
    description: data.description,
    notes: data.notes ?? "",
    date: data.date,
    status: "active",
    createdBy: userProfile.id,
    createdByName: userProfile.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return movementRef.id;
}

export async function getMovementsByDateRange(clinicId: string, startDate: string, endDate: string) {
  const movementsQuery = query(
    movementsCollection,
    where("clinicId", "==", clinicId),
    where("status", "in", ["active", "edited"]),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "desc"),
  );

  const snapshot = await getDocs(movementsQuery);
  return snapshot.docs.map((movementDoc) => normalizeMovement(movementDoc.id, movementDoc.data()));
}

export async function getRecentMovements(clinicId: string, limitNumber: number) {
  const movementsQuery = query(
    movementsCollection,
    where("clinicId", "==", clinicId),
    where("status", "in", ["active", "edited"]),
    orderBy("createdAt", "desc"),
    limit(limitNumber),
  );

  const snapshot = await getDocs(movementsQuery);
  return snapshot.docs.map((movementDoc) => normalizeMovement(movementDoc.id, movementDoc.data()));
}

export async function updateMovement(movementId: string, data: UpdateMovementInput, userProfile: UserProfile) {
  const movementRef = doc(db, "movements", movementId);

  await updateDoc(movementRef, {
    ...data,
    status: "edited",
    updatedAt: serverTimestamp(),
    updatedBy: userProfile.id,
  });
}

export async function softDeleteMovement(movementId: string, userProfile: UserProfile) {
  const movementRef = doc(db, "movements", movementId);

  await updateDoc(movementRef, {
    status: "deleted",
    deletedAt: serverTimestamp(),
    deletedBy: userProfile.id,
    updatedAt: serverTimestamp(),
  });
}

export async function getTodayMovements(clinicId: string) {
  const today = getTodayDate();
  return getMovementsByDateRange(clinicId, today, today);
}

export async function getCurrentMonthMovements(clinicId: string) {
  const range = getMonthDateRange();
  return getMovementsByDateRange(clinicId, range.startDate, range.endDate);
}
