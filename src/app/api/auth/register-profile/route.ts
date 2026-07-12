import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { CLINIC_ID } from "@/lib/constants";
import {
  getFirebaseAdminAuth,
  getFirebaseAdminFirestore,
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

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    console.error("Registration profile error:", { code: "admin/not-configured", name: null });
    return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 503 });
  }

  const adminAuth = getFirebaseAdminAuth();
  const adminDb = getFirebaseAdminFirestore();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 503 });
  }

  const idToken = getBearerToken(request);
  if (!idToken) {
    return NextResponse.json({ code: "auth/invalid-credential" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken, true);
  } catch (error) {
    console.error("Registration profile error:", getServerErrorDetails(error));
    return NextResponse.json({ code: "auth/invalid-credential" }, { status: 401 });
  }

  let body: RegisterProfileRequest;
  try {
    body = (await request.json()) as RegisterProfileRequest;
  } catch {
    return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 400 });
  }

  const cleanName = body.name?.trim() ?? "";
  const cleanUsername = normalizeUsername(body.username ?? "");

  if (cleanName.length < 2 || cleanName.length > 100) {
    return NextResponse.json({ code: "validation/missing-name" }, { status: 400 });
  }

  if (!isValidUsername(cleanUsername)) {
    return NextResponse.json({ code: "validation/invalid-username" }, { status: 400 });
  }

  let userRecord;
  try {
    userRecord = await adminAuth.getUser(decodedToken.uid);
  } catch (error) {
    console.error("Registration profile error:", getServerErrorDetails(error));
    return NextResponse.json({ code: "auth/invalid-credential" }, { status: 401 });
  }

  const email = userRecord.email?.trim().toLowerCase() ?? "";
  if (!email) {
    return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 400 });
  }

  const userRef = adminDb.collection("users").doc(decodedToken.uid);
  const usernameRef = adminDb.collection("usernames").doc(cleanUsername);

  try {
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
        throw new UsernameTakenError();
      }

      transaction.create(usernameRef, {
        uid: decodedToken.uid,
        email,
        clinicId: CLINIC_ID,
        createdAt: FieldValue.serverTimestamp(),
      });
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
        console.error("Registration cleanup error:", getServerErrorDetails(cleanupError));
      }

      return NextResponse.json({ code: "registration/username-in-use" }, { status: 409 });
    }

    if (error instanceof ExistingProfileError) {
      return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 409 });
    }

    console.error("Registration profile error:", getServerErrorDetails(error));

    try {
      const profileSnapshot = await userRef.get();
      if (!profileSnapshot.exists) {
        await adminAuth.deleteUser(decodedToken.uid);
      }
    } catch (cleanupError) {
      console.error("Registration cleanup error:", getServerErrorDetails(cleanupError));
    }

    return NextResponse.json({ code: "registration/profile-create-failed" }, { status: 500 });
  }
}
