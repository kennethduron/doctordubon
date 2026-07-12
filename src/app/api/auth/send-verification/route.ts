import { NextResponse } from "next/server";
import { buildVerificationEmail } from "@/lib/auth-email-templates";
import { APP_URL } from "@/lib/constants";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";

export const runtime = "nodejs";

type SendVerificationRequest = {
  idToken?: string;
};

function extractOobCode(firebaseLink: string) {
  return new URL(firebaseLink).searchParams.get("oobCode");
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured() || !isResendConfigured()) {
    console.warn("Professional verification email skipped: Firebase Admin or Resend is not configured.");
    return NextResponse.json({ sent: false, fallback: "missing-email-provider" });
  }

  try {
    const body = (await request.json()) as SendVerificationRequest;

    if (!body.idToken) {
      return NextResponse.json({ sent: false, error: "missing-token" }, { status: 400 });
    }

    const adminAuth = getFirebaseAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ sent: false, fallback: "missing-admin" });
    }

    const decodedToken = await adminAuth.verifyIdToken(body.idToken);
    const user = await adminAuth.getUser(decodedToken.uid);

    if (!user.email) {
      return NextResponse.json({ sent: false, error: "missing-email" }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ sent: true, alreadyVerified: true });
    }

    const firebaseLink = await adminAuth.generateEmailVerificationLink(user.email, {
      url: `${APP_URL}/verificar-correo`,
      handleCodeInApp: false,
    });
    const oobCode = extractOobCode(firebaseLink);

    if (!oobCode) {
      throw new Error("No se pudo obtener el código de verificación.");
    }

    const actionUrl = `${APP_URL}/verificar-correo?oobCode=${encodeURIComponent(oobCode)}`;
    const email = buildVerificationEmail({ name: user.displayName, actionUrl });

    await sendResendEmail({
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Professional verification email error:", error);
    return NextResponse.json({ sent: false, fallback: "send-failed" });
  }
}
