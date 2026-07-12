import type { ActionCodeSettings, User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { APP_URL, CLINIC_ID } from "@/lib/constants";
import { auth, db, getFirebaseErrorLogDetails } from "@/lib/firebase";
import { createAccessRequestNotification } from "@/lib/notifications";

function createClientError(code: string) {
  return Object.assign(new Error(code), { code });
}

const emailActionSettings: ActionCodeSettings = {
  url: `${APP_URL}/login`,
  handleCodeInApp: false,
};

const usernamePattern = /^[a-z0-9._-]{3,30}$/;

type ProfessionalEmailResponse = {
  sent?: boolean;
  code?: string;
};

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function getUsernameValidationMessage(username: string) {
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername) return "Ingrese un usuario.";
  if (cleanUsername.length < 3) return "El usuario debe tener al menos 3 caracteres.";
  if (cleanUsername.length > 30) return "El usuario no puede tener más de 30 caracteres.";
  if (!usernamePattern.test(cleanUsername)) {
    return "El usuario solo puede contener letras, números, punto, guion bajo o guion medio.";
  }

  return null;
}

async function postProfessionalEmail(endpoint: string, body: Record<string, string>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as ProfessionalEmailResponse;

  if (!response.ok && payload.code) {
    throw createClientError(payload.code);
  }

  return Boolean(payload.sent);
}

async function sendProfessionalVerificationEmail(user: User) {
  const idToken = await user.getIdToken();
  return postProfessionalEmail("/api/auth/send-verification", { idToken });
}

async function sendProfessionalPasswordResetEmail(email: string) {
  return postProfessionalEmail("/api/auth/send-password-reset", { email });
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(name: string, username: string, email: string, password: string) {
  const cleanName = name.trim();
  const cleanUsername = normalizeUsername(username);
  const cleanEmail = email.trim();

  if (!cleanName) {
    throw createClientError("validation/missing-name");
  }

  if (!cleanEmail) {
    throw createClientError("validation/missing-email");
  }

  if (getUsernameValidationMessage(cleanUsername)) {
    throw createClientError("validation/invalid-username");
  }

  if (!password) {
    throw createClientError("auth/missing-password");
  }

  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  await updateProfile(credential.user, { displayName: cleanName });

  const userProfile = {
    id: credential.user.uid,
    clinicId: CLINIC_ID,
    name: cleanName,
    username: cleanUsername,
    email: credential.user.email ?? cleanEmail,
    role: "admin" as const,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "users", credential.user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    throw createClientError("registration/profile-create-failed");
  }

  try {
    await createAccessRequestNotification(userProfile);
  } catch (error) {
    console.error("Notification creation error:", getFirebaseErrorLogDetails(error));
  }

  try {
    await sendVerificationEmailIfNeeded(credential.user);
    return { credential, verificationEmailSent: true };
  } catch (error) {
    console.error("Email verification error:", getFirebaseErrorLogDetails(error));
    return { credential, verificationEmailSent: false };
  }
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  try {
    const professionalEmailSent = await sendProfessionalPasswordResetEmail(email.trim());

    if (professionalEmailSent) {
      return;
    }
  } catch (error) {
    console.error("Password reset error:", getFirebaseErrorLogDetails(error));
    throw error;
  }

  try {
    return await sendPasswordResetEmail(auth, email.trim(), emailActionSettings);
  } catch (error) {
    console.error("Password reset error:", getFirebaseErrorLogDetails(error));
    throw error;
  }
}

export async function sendVerificationEmailIfNeeded(user: User) {
  if (user.emailVerified) {
    return false;
  }

  try {
    const professionalEmailSent = await sendProfessionalVerificationEmail(user);

    if (professionalEmailSent) {
      return true;
    }
  } catch (error) {
    console.error("Email verification error:", getFirebaseErrorLogDetails(error));
  }

  try {
    await sendEmailVerification(user, emailActionSettings);
    return true;
  } catch (error) {
    console.error("Email verification error:", getFirebaseErrorLogDetails(error));
    throw error;
  }
}
