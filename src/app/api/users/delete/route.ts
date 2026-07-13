import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  getFirebaseAdminAuth,
  getFirebaseAdminFirestore,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";
import { isValidUsername, normalizeUsername } from "@/lib/username";

export const runtime = "nodejs";

type DeleteUserRequest = {
  targetUserId?: string;
};

type ServerUserProfile = {
  id: string;
  clinicId: string;
  role: "technical_owner" | "business_owner" | "admin";
  username: string | null;
  status: "active" | "pending" | "disabled";
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function getServerErrorDetails(error: unknown) {
  return {
    code:
      typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
        ? error.code
        : null,
    name:
      typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
        ? error.name
        : null,
  };
}

function parseProfile(id: string, data: Record<string, unknown>): ServerUserProfile | null {
  const role = data.role;
  const status = data.status;
  if (
    typeof data.clinicId !== "string" ||
    (role !== "technical_owner" && role !== "business_owner" && role !== "admin") ||
    (status !== "active" && status !== "pending" && status !== "disabled")
  ) {
    return null;
  }

  const username = typeof data.username === "string" && isValidUsername(data.username)
    ? normalizeUsername(data.username)
    : null;

  return {
    id,
    clinicId: data.clinicId,
    role,
    username,
    status,
  };
}

function getDeletePermissionError(actor: ServerUserProfile, target: ServerUserProfile) {
  if (actor.id === target.id) {
    return "users/delete-self";
  }

  if (target.role === "technical_owner") {
    return "users/delete-protected";
  }

  if (actor.status !== "active" || actor.clinicId !== target.clinicId) {
    return "users/not-authorized";
  }

  if (actor.role === "technical_owner") {
    return null;
  }

  if (actor.role === "business_owner" && target.role === "admin") {
    return null;
  }

  return "users/not-authorized";
}

async function userHasImportantHistory(
  adminDb: NonNullable<ReturnType<typeof getFirebaseAdminFirestore>>,
  userId: string,
) {
  const movementQueries = ["createdBy", "updatedBy", "deletedBy"].map((field) =>
    adminDb.collection("movements").where(field, "==", userId).limit(1).get(),
  );
  const clinicUpdateQuery = adminDb.collection("clinics").where("updatedBy", "==", userId).limit(1).get();
  const snapshots = await Promise.all([...movementQueries, clinicUpdateQuery]);
  return snapshots.some((snapshot) => !snapshot.empty);
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    console.error("Safe user deletion error:", { code: "admin/not-configured", name: null });
    return NextResponse.json({ code: "users/delete-unavailable" }, { status: 503 });
  }

  const adminAuth = getFirebaseAdminAuth();
  const adminDb = getFirebaseAdminFirestore();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ code: "users/delete-unavailable" }, { status: 503 });
  }

  const idToken = getBearerToken(request);
  if (!idToken) {
    return NextResponse.json({ code: "users/not-authorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
  } catch (error) {
    console.error("Safe user deletion error:", getServerErrorDetails(error));
    return NextResponse.json({ code: "users/not-authorized" }, { status: 401 });
  }

  let body: DeleteUserRequest;
  try {
    body = (await request.json()) as DeleteUserRequest;
  } catch {
    return NextResponse.json({ code: "users/delete-failed" }, { status: 400 });
  }

  const targetUserId = body.targetUserId?.trim() ?? "";
  if (!targetUserId || targetUserId.length > 128 || targetUserId.includes("/")) {
    return NextResponse.json({ code: "users/delete-failed" }, { status: 400 });
  }

  try {
    const actorRef = adminDb.collection("users").doc(decodedToken.uid);
    const targetRef = adminDb.collection("users").doc(targetUserId);
    const [actorSnapshot, targetSnapshot] = await Promise.all([actorRef.get(), targetRef.get()]);

    if (!actorSnapshot.exists || !targetSnapshot.exists) {
      return NextResponse.json({ code: "users/delete-failed" }, { status: 404 });
    }

    const actor = parseProfile(actorSnapshot.id, actorSnapshot.data() ?? {});
    const target = parseProfile(targetSnapshot.id, targetSnapshot.data() ?? {});
    if (!actor || !target) {
      return NextResponse.json({ code: "users/not-authorized" }, { status: 403 });
    }

    const permissionError = getDeletePermissionError(actor, target);
    if (permissionError) {
      return NextResponse.json({ code: permissionError }, { status: 403 });
    }

    if (await userHasImportantHistory(adminDb, target.id)) {
      return NextResponse.json({ code: "users/has-history" }, { status: 409 });
    }

    try {
      await adminAuth.deleteUser(target.id);
    } catch (error) {
      const details = getServerErrorDetails(error);
      if (details.code !== "auth/user-not-found") {
        throw error;
      }
    }

    const usernameRef = target.username ? adminDb.collection("usernames").doc(target.username) : null;
    const notificationRef = adminDb.collection("notifications").doc();
    const visibleToRoles = target.role === "admin"
      ? ["technical_owner", "business_owner"]
      : ["technical_owner"];
    const audience = target.role === "admin" ? "responsibles" : "technical_owner";

    await adminDb.runTransaction(async (transaction) => {
      const usernameSnapshot = usernameRef ? await transaction.get(usernameRef) : null;
      transaction.delete(targetRef);

      if (usernameRef && usernameSnapshot?.exists && usernameSnapshot.data()?.uid === target.id) {
        transaction.delete(usernameRef);
      }

      transaction.create(notificationRef, {
        id: notificationRef.id,
        clinicId: target.clinicId,
        title: "Usuario eliminado",
        message: "Una cuenta sin historial fue eliminada del sistema.",
        type: "system",
        severity: "warning",
        audience,
        recipientUserId: "",
        actorUserId: "",
        actorRole: "",
        recipientUserRole: "",
        relatedUserId: "",
        relatedUserRole: "",
        relatedMovementId: "",
        visibleToRoles,
        visibleToUserIds: [],
        readBy: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Safe user deletion error:", getServerErrorDetails(error));
    return NextResponse.json({ code: "users/delete-failed" }, { status: 500 });
  }
}
