import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function normalizeEnvironmentValue(value?: string) {
  const cleanValue = value?.trim();
  if (!cleanValue) return "";

  const hasDoubleQuotes = cleanValue.startsWith('"') && cleanValue.endsWith('"');
  const hasSingleQuotes = cleanValue.startsWith("'") && cleanValue.endsWith("'");
  return hasDoubleQuotes || hasSingleQuotes ? cleanValue.slice(1, -1).trim() : cleanValue;
}

function normalizePrivateKey(privateKey?: string) {
  return normalizeEnvironmentValue(privateKey)
    .replace(/\\\\r\\\\n/g, "\n")
    .replace(/\\\\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
}

export function getMissingFirebaseAdminVariables() {
  const missingVariables: string[] = [];

  if (!normalizeEnvironmentValue(process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)) {
    missingVariables.push("FIREBASE_ADMIN_PROJECT_ID");
  }
  if (!normalizeEnvironmentValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL)) {
    missingVariables.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  }
  if (!normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY)) {
    missingVariables.push("FIREBASE_ADMIN_PRIVATE_KEY");
  }

  return missingVariables;
}

export function isFirebaseAdminConfigured() {
  return getMissingFirebaseAdminVariables().length === 0;
}

export function getFirebaseAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;

  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  return initializeApp({
    credential: cert({
      projectId: normalizeEnvironmentValue(
        process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      ),
      clientEmail: normalizeEnvironmentValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
      privateKey: normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
    }),
  });
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseAdminFirestore(): Firestore | null {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}
