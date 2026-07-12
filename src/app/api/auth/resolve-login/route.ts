import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { CLINIC_ID } from "@/lib/constants";
import { getFirebaseAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { isValidUsername, normalizeUsername } from "@/lib/username";

export const runtime = "nodejs";

type ResolveLoginRequest = {
  identifier?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function noStoreJson(body: Record<string, string>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: ResolveLoginRequest;
  try {
    body = (await request.json()) as ResolveLoginRequest;
  } catch {
    return noStoreJson({ code: "auth/invalid-credential" }, 401);
  }

  const identifier = body.identifier?.trim().toLowerCase() ?? "";
  if (!identifier || identifier.length > 254) {
    return noStoreJson({ code: "auth/invalid-credential" }, 401);
  }

  if (emailPattern.test(identifier)) {
    return noStoreJson({ email: identifier });
  }

  const username = normalizeUsername(identifier);
  if (!isValidUsername(username)) {
    return noStoreJson({ code: "auth/invalid-credential" }, 401);
  }

  if (!isFirebaseAdminConfigured()) {
    console.error("Login resolution error:", { code: "admin/not-configured", name: null });
    return noStoreJson({ code: "auth/invalid-credential" }, 401);
  }

  const adminDb = getFirebaseAdminFirestore();
  if (!adminDb) {
    console.error("Login resolution error:", { code: "admin/firestore-unavailable", name: null });
    return noStoreJson({ code: "auth/invalid-credential" }, 401);
  }

  try {
    const usernameRef = adminDb.collection("usernames").doc(username);
    const usernameSnapshot = await usernameRef.get();

    if (usernameSnapshot.exists) {
      const email = String(usernameSnapshot.data()?.email ?? "").trim().toLowerCase();
      return emailPattern.test(email)
        ? noStoreJson({ email })
        : noStoreJson({ code: "auth/invalid-credential" }, 401);
    }

    const legacyUsers = await adminDb
      .collection("users")
      .where("username", "==", username)
      .limit(2)
      .get();

    if (legacyUsers.size !== 1) {
      return noStoreJson({ code: "auth/invalid-credential" }, 401);
    }

    const legacyUser = legacyUsers.docs[0];
    const email = String(legacyUser.data().email ?? "").trim().toLowerCase();
    if (!emailPattern.test(email)) {
      return noStoreJson({ code: "auth/invalid-credential" }, 401);
    }

    try {
      await usernameRef.create({
        uid: legacyUser.id,
        email,
        clinicId: String(legacyUser.data().clinicId ?? CLINIC_ID),
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Username index backfill error:", getServerErrorDetails(error));
    }

    return noStoreJson({ email });
  } catch (error) {
    console.error("Login resolution error:", getServerErrorDetails(error));
    return noStoreJson({ code: "auth/invalid-credential" }, 401);
  }
}
