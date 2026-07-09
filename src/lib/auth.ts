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
import { CLINIC_ID } from "@/lib/constants";
import { auth, db } from "@/lib/firebase";

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName: name });
  await setDoc(doc(db, "users", credential.user.uid), {
    id: credential.user.uid,
    clinicId: CLINIC_ID,
    name,
    email: credential.user.email ?? email,
    role: "admin",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await sendVerificationEmailIfNeeded(credential.user);

  return credential;
}

export async function logout() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function sendVerificationEmailIfNeeded(user: User) {
  if (user.emailVerified) {
    return;
  }

  await sendEmailVerification(user);
}
