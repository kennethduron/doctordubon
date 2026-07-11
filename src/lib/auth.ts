import type { User } from "firebase/auth";
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
import { auth, db } from "@/lib/firebase";

function createClientError(code: string) {
  return Object.assign(new Error(code), { code });
}

const emailActionSettings = {
  url: `${APP_URL.replace(/\/$/, "")}/login`,
  handleCodeInApp: false,
};

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(name: string, email: string, password: string) {
  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (!cleanName) {
    throw createClientError("validation/missing-name");
  }

  if (!cleanEmail) {
    throw createClientError("validation/missing-email");
  }

  if (!password) {
    throw createClientError("auth/missing-password");
  }

  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  await updateProfile(credential.user, { displayName: cleanName });

  try {
    await setDoc(doc(db, "users", credential.user.uid), {
      id: credential.user.uid,
      clinicId: CLINIC_ID,
      name: cleanName,
      email: credential.user.email ?? cleanEmail,
      role: "admin",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    throw createClientError("registration/profile-create-failed");
  }

  try {
    await sendVerificationEmailIfNeeded(credential.user);
    return { credential, verificationEmailSent: true };
  } catch {
    return { credential, verificationEmailSent: false };
  }
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function sendVerificationEmailIfNeeded(user: User) {
  if (user.emailVerified) {
    return false;
  }

  await sendEmailVerification(user, emailActionSettings);
  return true;
}
