import { FirebaseError, initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

const fallbackConfig = {
  apiKey: "local-development-placeholder-key",
  authDomain: "local-development-placeholder.firebaseapp.com",
  projectId: "local-development-placeholder",
  storageBucket: "local-development-placeholder.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:localplaceholder",
};

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
};

export function isFirebaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  );
}

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
auth.languageCode = "es";
export const db: Firestore = getFirestore(app);

export function getFirebasePlaceholder() {
  return {
    ready: isFirebaseConfigured(),
    message: isFirebaseConfigured()
      ? "Firebase Authentication y Cloud Firestore están configurados."
      : "Configura las variables de Firebase en .env.local para activar Auth y Firestore.",
  };
}

export function getFirebaseErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Ocurrió un error inesperado. Intente nuevamente.";
  }

  const messages: Record<string, string> = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta con este correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/too-many-requests": "Demasiados intentos. Intente nuevamente más tarde.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/missing-password": "Ingrese una contraseña.",
    "auth/network-request-failed": "No se pudo conectar con Firebase. Revise su conexión.",
    "auth/api-key-not-valid": "Firebase no está configurado correctamente.",
    "auth/invalid-api-key": "Firebase no está configurado correctamente.",
    "permission-denied": "No tiene permisos para realizar esta acción.",
  };

  return messages[error.code] ?? "No se pudo completar la acción. Intente nuevamente.";
}
