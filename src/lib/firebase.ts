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

const missingFirebaseConfig = [
  ["apiKey", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
  ["authDomain", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN],
  ["projectId", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
  ["appId", process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
].filter(([, value]) => !value);

if (missingFirebaseConfig.length > 0) {
  console.warn("Missing public Firebase configuration:", missingFirebaseConfig.map(([key]) => key));
}

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
auth.languageCode = "es";
export const db: Firestore = getFirestore(app);

export function getFirebaseErrorCode(error: unknown) {
  return error instanceof FirebaseError
    ? error.code
    : typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : null;
}

export function getFirebaseErrorLogDetails(error: unknown) {
  return {
    code: getFirebaseErrorCode(error),
    message:
      typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
        ? error.message
        : null,
    name:
      typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
        ? error.name
        : null,
  };
}

export function getFirebaseErrorMessage(
  error: unknown,
  fallbackMessage = "No se pudo completar la acción. Intenta nuevamente.",
) {
  const code = getFirebaseErrorCode(error);

  const messages: Record<string, string> = {
    "validation/missing-name": "Ingrese el nombre completo.",
    "validation/missing-email": "Ingrese el correo.",
    "validation/invalid-username":
      "El usuario debe tener entre 3 y 30 caracteres y usar solo letras, números, punto, guion bajo o guion medio.",
    "registration/profile-create-failed":
      "La cuenta fue creada, pero no se pudo completar el perfil de acceso. Contacta al encargado del sistema.",
    "registration/verification-email-failed":
      "La cuenta fue creada, pero no se pudo enviar el correo de verificación. Puedes solicitar otro enlace desde la pantalla de acceso.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta con este correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos antes de solicitar otro enlace.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/email-already-in-use": "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/missing-password": "Ingrese una contraseña.",
    "auth/operation-not-allowed": "El registro con correo y contraseña no está habilitado. Contacta al encargado del sistema.",
    "auth/network-request-failed": "No se pudo conectar con el servicio de autenticación. Revisa tu conexión.",
    "auth/unauthorized-domain":
      "Este dominio no está autorizado para iniciar sesión. Contacta al encargado del sistema.",
    "auth/unauthorized-continue-uri":
      "No se pudo enviar el enlace en este momento. Contacta al encargado del sistema.",
    "auth/invalid-continue-uri":
      "No se pudo enviar el enlace en este momento. Contacta al encargado del sistema.",
    "auth/user-token-expired": "Tu sesión expiró. Cierra sesión e inicia nuevamente.",
    "auth/requires-recent-login": "Por seguridad, vuelve a iniciar sesión y solicita otro enlace.",
    "auth/api-key-not-valid": "La conexión del sistema no está configurada correctamente.",
    "auth/invalid-api-key": "La conexión del sistema no está configurada correctamente.",
    "permission-denied": "No tienes permiso para completar esta acción.",
  };

  if (code && messages[code]) {
    return messages[code];
  }

  return fallbackMessage;
}
