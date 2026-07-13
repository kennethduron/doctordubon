import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { CLINIC_ID } from "@/lib/constants";
import {
  getFirebaseAdminAuth,
  getFirebaseAdminFirestore,
  getMissingFirebaseAdminVariables,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";
import { isValidUsername, normalizeUsername } from "@/lib/username";

export const runtime = "nodejs";

type RegisterProfileRequest = {
  name?: string;
  username?: string;
};

class UsernameTakenError extends Error {}
class ExistingProfileError extends Error {}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function getServerErrorDetails(error: unknown) {
  const rawMessage =
    typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
      ? error.message
      : null;

  return {
    code:
      typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
        ? error.code
        : null,
    message:
      rawMessage
        ?.replace(
          /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
          "[redacted-private-key]",
        )
        .replace(
          /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
          "[redacted-token]",
        )
        .slice(0, 500) ?? null,
    name:
      typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
        ? error.name
        : null,
  };
}

function isAuthUserNotFound(error: unknown) {
  return (
    typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "auth/user-not-found"
  );
}

async function authUserExists(adminAuth: Auth, uid: string) {
  try {
    await adminAuth.getUser(uid);
    return true;
  } catch (error) {
    if (isAuthUserNotFound(error)) {
      return false;
    }

    throw error;
  }
}

async function removeOrphanedUsernameIndex(adminAuth: Auth, adminDb: Firestore, cleanUsername: string) {
  const usernameRef = adminDb.collection("usernames").doc(cleanUsername);
  const usernameSnapshot = await usernameRef.get();

  if (!usernameSnapshot.exists) {
    return;
  }

  const indexedUid = String(usernameSnapshot.data()?.uid ?? "").trim();
  let indexedProfileExists = false;
  let indexedAuthUserExists = false;

  if (indexedUid) {
    const indexedProfileSnapshot = await adminDb.collection("users").doc(indexedUid).get();
    indexedProfileExists = indexedProfileSnapshot.exists;
    indexedAuthUserExists = await authUserExists(adminAuth, indexedUid);
  } else {
    const matchingProfiles = await adminDb
      .collection("users")
      .where("username", "==", cleanUsername)
      .limit(1)
      .get();
    indexedProfileExists = !matchingProfiles.empty;
  }

  if (indexedAuthUserExists || indexedProfileExists) {
    return;
  }

  await adminDb.runTransaction(async (transaction) => {
    const currentUsernameSnapshot = await transaction.get(usernameRef);

    if (!currentUsernameSnapshot.exists) {
      return;
    }

    const currentIndexedUid = String(currentUsernameSnapshot.data()?.uid ?? "").trim();
    if (currentIndexedUid === indexedUid) {
      transaction.delete(usernameRef);
    }
  });

  console.warn("Register profile orphaned username index cleaned:", {
    code: "registration/orphaned-username-cleaned",
  });
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    console.error("Register profile error:", {
      code: "admin/not-configured",
      message: "Firebase Admin no está configurado correctamente.",
      name: "ConfigurationError",
      missingVariables: getMissingFirebaseAdminVariables(),
    });
    return NextResponse.json({ code: "registration/profile-create-failed", canDeleteAuthUser: true }, { status: 503 });
  }

  let adminAuth;
  let adminDb;

  try {
    adminAuth = getFirebaseAdminAuth();
    adminDb = getFirebaseAdminFirestore();
  } catch (error) {
    console.error("Register profile error:", getServerErrorDetails(error));
    return NextResponse.json({ code: "registration/profile-create-failed", canDeleteAuthUser: true }, { status: 503 });
  }

  if (!adminAuth || !adminDb) {
    console.error("Register profile error:", {
      code: "admin/initialization-failed",
      message: "Firebase Admin no está configurado correctamente.",
      name: "ConfigurationError",
    });
    return NextResponse.json({ code: "registration/profile-create-failed", canDeleteAuthUser: true }, { status: 503 });
  }

  const idToken = getBearerToken(request);
  if (!idToken) {
    return NextResponse.json({ code: "auth/invalid-credential", canDeleteAuthUser: true }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Register profile error:", getServerErrorDetails(error));
    return NextResponse.json({ code: "auth/invalid-credential", canDeleteAuthUser: true }, { status: 401 });
  }

  let body: RegisterProfileRequest;
  try {
    body = (await request.json()) as RegisterProfileRequest;
  } catch {
    return NextResponse.json({ code: "registration/profile-create-failed", canDeleteAuthUser: true }, { status: 400 });
  }

  const cleanName = body.name?.trim() ?? "";
  const cleanUsername = normalizeUsername(body.username ?? "");

  if (cleanName.length < 2 || cleanName.length > 100) {
    return NextResponse.json({ code: "validation/missing-name", canDeleteAuthUser: true }, { status: 400 });
  }

  if (!isValidUsername(cleanUsername)) {
    return NextResponse.json({ code: "validation/invalid-username", canDeleteAuthUser: true }, { status: 400 });
  }

  const email = typeof decodedToken.email === "string" ? decodedToken.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Register profile error:", {
      code: "auth/missing-email",
      message: "El token verificado no contiene un correo válido.",
      name: "ValidationError",
    });
    return NextResponse.json({ code: "registration/profile-create-failed", canDeleteAuthUser: true }, { status: 400 });
  }

  const userRef = adminDb.collection("users").doc(decodedToken.uid);
  const usernameRef = adminDb.collection("usernames").doc(cleanUsername);

  try {
    await removeOrphanedUsernameIndex(adminAuth, adminDb, cleanUsername);

    await adminDb.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const usernameSnapshot = await transaction.get(usernameRef);
      const matchingUsers = await transaction.get(
        adminDb.collection("users").where("username", "==", cleanUsername).limit(2),
      );

      if (matchingUsers.docs.some((profile) => profile.id !== decodedToken.uid)) {
        throw new UsernameTakenError();
      }

      if (userSnapshot.exists) {
        const existingUsername = normalizeUsername(String(userSnapshot.data()?.username ?? ""));
        if (existingUsername !== cleanUsername) {
          throw new ExistingProfileError();
        }

        if (usernameSnapshot.exists && usernameSnapshot.data()?.uid !== decodedToken.uid) {
          throw new UsernameTakenError();
        }

        if (!usernameSnapshot.exists) {
          transaction.create(usernameRef, {
            uid: decodedToken.uid,
            email,
            clinicId: CLINIC_ID,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        return;
      }

      if (usernameSnapshot.exists) {
        if (usernameSnapshot.data()?.uid !== decodedToken.uid) {
          throw new UsernameTakenError();
        }
      } else {
        transaction.create(usernameRef, {
          uid: decodedToken.uid,
          email,
          clinicId: CLINIC_ID,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.create(userRef, {
        id: decodedToken.uid,
        clinicId: CLINIC_ID,
        name: cleanName,
        username: cleanUsername,
        email,
        role: "admin",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ created: true });
  } catch (error) {
    if (error instanceof UsernameTakenError) {
      try {
        const profileSnapshot = await userRef.get();
        if (!profileSnapshot.exists) {
          await adminAuth.deleteUser(decodedToken.uid);
        }
      } catch (cleanupError) {
        console.error("Register profile cleanup error:", getServerErrorDetails(cleanupError));
      }

      return NextResponse.json({ code: "registration/username-in-use", canDeleteAuthUser: true }, { status: 409 });
    }

    if (error instanceof ExistingProfileError) {
      return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 409 });
    }

    console.error("Register profile error:", getServerErrorDetails(error));

    let canDeleteAuthUser = false;

    try {
      const [profileSnapshot, usernameSnapshot] = await Promise.all([
        userRef.get(),
        usernameRef.get(),
      ]);
      const profileUsername = normalizeUsername(String(profileSnapshot.data()?.username ?? ""));
      const profileWasCompleted =
        profileSnapshot.exists
        && profileUsername === cleanUsername
        && usernameSnapshot.exists
        && usernameSnapshot.data()?.uid === decodedToken.uid;

      if (profileWasCompleted) {
        return NextResponse.json({ created: true });
      }

      if (!profileSnapshot.exists && !usernameSnapshot.exists) {
        await adminAuth.deleteUser(decodedToken.uid);
        canDeleteAuthUser = true;
      }
    } catch (cleanupError) {
      console.error("Register profile cleanup error:", getServerErrorDetails(cleanupError));
    }

    return NextResponse.json(
      { code: "registration/profile-create-failed", canDeleteAuthUser },
      { status: 500 },
    );
  }
}
