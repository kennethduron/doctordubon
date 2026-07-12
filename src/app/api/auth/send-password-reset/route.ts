import { NextResponse } from "next/server";
import { buildPasswordResetEmail } from "@/lib/auth-email-templates";
import { APP_URL } from "@/lib/constants";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";

export const runtime = "nodejs";

type PasswordResetRequest = {
  email?: string;
};

function extractOobCode(firebaseLink: string) {
  return new URL(firebaseLink).searchParams.get("oobCode");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json()) as PasswordResetRequest;
  const emailAddress = body.email?.trim().toLowerCase() ?? "";

  if (!emailAddress || !isValidEmail(emailAddress)) {
    return NextResponse.json({ sent: false, code: "auth/invalid-email" }, { status: 400 });
  }

  if (!isFirebaseAdminConfigured() || !isResendConfigured()) {
    console.warn("Professional password reset email skipped: Firebase Admin or Resend is not configured.");
    return NextResponse.json({ sent: false, fallback: "missing-email-provider" });
  }

  try {
    const adminAuth = getFirebaseAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ sent: false, fallback: "missing-admin" });
    }

    let user;
    try {
      user = await adminAuth.getUserByEmail(emailAddress);
    } catch (error) {
      console.warn("Password reset requested for a non-existing account.", error);
      return NextResponse.json({ sent: true });
    }

    const firebaseLink = await adminAuth.generatePasswordResetLink(emailAddress, {
      url: `${APP_URL}/restablecer-contrasena`,
      handleCodeInApp: false,
    });
    const oobCode = extractOobCode(firebaseLink);

    if (!oobCode) {
      throw new Error("No se pudo obtener el código de recuperación.");
    }

    const actionUrl = `${APP_URL}/restablecer-contrasena?oobCode=${encodeURIComponent(oobCode)}`;
    const email = buildPasswordResetEmail({ name: user.displayName, actionUrl });

    await sendResendEmail({
      to: emailAddress,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Professional password reset email error:", error);
    return NextResponse.json({ sent: false, fallback: "send-failed" });
  }
}
