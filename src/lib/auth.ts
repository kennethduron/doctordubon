import type { ActionCodeSettings, User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { APP_URL, CLINIC_ID } from "@/lib/constants";
import { auth, getFirebaseErrorCode, getFirebaseErrorLogDetails } from "@/lib/firebase";
import { createAccessRequestNotification } from "@/lib/notifications";
import { getUsernameValidationMessage, normalizeUsername } from "@/lib/username";

function createClientError(code: string, canDeleteAuthUser = false) {
  return Object.assign(new Error(code), { code, canDeleteAuthUser });
}

function canDeleteIncompleteAuthUser(error: unknown) {
  return Boolean(
    typeof error === "object"
      && error !== null
      && "canDeleteAuthUser" in error
      && error.canDeleteAuthUser === true,
  );
}

async function removeIncompleteAuthUser(user: User) {
  try {
    await deleteUser(user);
    return true;
  } catch (error) {
    const code = getFirebaseErrorCode(error);
    const userAlreadyRemoved = code === "auth/user-not-found" || code === "auth/user-token-expired";
    console.error("Registration cleanup error:", getFirebaseErrorLogDetails(error));
    return userAlreadyRemoved;
  }
}

const emailActionSettings: ActionCodeSettings = {
  url: APP_URL + "/login",
  handleCodeInApp: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfessionalEmailResponse = {
  sent?: boolean;
  code?: string;
};

type ApiResponse = {
  email?: string;
  code?: string;
  canDeleteAuthUser?: boolean;
};

export { getUsernameValidationMessage, normalizeUsername } from "@/lib/username";

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

async function resolveLoginEmail(identifier: string) {
  const cleanIdentifier = identifier.trim().toLowerCase();
  if (emailPattern.test(cleanIdentifier)) {
    return cleanIdentifier;
  }

  const username = normalizeUsername(cleanIdentifier);
  if (getUsernameValidationMessage(username)) {
    throw createClientError("auth/invalid-credential");
  }

  const response = await fetch("/api/auth/resolve-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: username }),
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse;

  if (!response.ok || !payload.email || !emailPattern.test(payload.email)) {
    throw createClientError("auth/invalid-credential");
  }

  return payload.email;
}

async function createRegistrationProfile(user: User, name: string, username: string) {
  const idToken = await user.getIdToken();
  let response: Response;

  try {
    response = await fetch("/api/auth/register-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + idToken,
      },
      body: JSON.stringify({ name, username }),
    });
  } catch (error) {
    console.error("Registration profile error:", getFirebaseErrorLogDetails(error));
    throw createClientError("registration/profile-create-failed-account-retained");
  }

  const payload = (await response.json().catch(() => ({}))) as ApiResponse;

  if (!response.ok) {
    throw createClientError(
      payload.code ?? "registration/profile-create-failed",
      payload.canDeleteAuthUser === true,
    );
  }
}

export async function loginWithIdentifier(identifier: string, password: string) {
  try {
    const email = await resolveLoginEmail(identifier);
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", getFirebaseErrorLogDetails(error));
    throw createClientError("auth/invalid-credential");
  }
}

export async function registerWithEmail(name: string, username: string, email: string, password: string) {
  const cleanName = name.trim();
  const cleanUsername = normalizeUsername(username);
  const cleanEmail = email.trim().toLowerCase();

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

  try {
    await updateProfile(credential.user, { displayName: cleanName });
  } catch (error) {
    const authUserRemoved = await removeIncompleteAuthUser(credential.user);
    await signOut(auth).catch(() => undefined);
    console.error("Registration profile error:", getFirebaseErrorLogDetails(error));
    throw createClientError(
      authUserRemoved
        ? "registration/profile-create-failed"
        : "registration/profile-create-failed-account-retained",
    );
  }

  try {
    await createRegistrationProfile(credential.user, cleanName, cleanUsername);
  } catch (error) {
    let authUserRemoved = false;

    if (canDeleteIncompleteAuthUser(error)) {
      authUserRemoved = await removeIncompleteAuthUser(credential.user);
    }

    await signOut(auth).catch(() => undefined);

    if (!canDeleteIncompleteAuthUser(error) || !authUserRemoved) {
      throw createClientError("registration/profile-create-failed-account-retained");
    }

    throw error;
  }

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
