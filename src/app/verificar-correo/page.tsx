"use client";

import Link from "next/link";
import { CheckCircle2, MailWarning } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { buttonStyles } from "@/components/ui/button";
import { auth, getFirebaseErrorLogDetails } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";

type VerificationState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const [state, setState] = useState<VerificationState>("loading");

  useEffect(() => {
    async function verifyEmail() {
      if (!oobCode) {
        setState("error");
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        setState("success");
      } catch (error) {
        console.error("Email verification error:", getFirebaseErrorLogDetails(error));
        setState("error");
      }
    }

    void verifyEmail();
  }, [oobCode]);

  if (state === "success") {
    return (
      <AuthShell
        title="Correo verificado"
        description="Tu correo fue confirmado correctamente. Si tu acceso aún está pendiente, el responsable del sistema debe aprobar tu cuenta."
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-mint text-mint-strong">
          <CheckCircle2 aria-hidden="true" size={30} />
        </div>
        <Link className={buttonStyles("primary", "w-full")} href="/login">
          Volver al login
        </Link>
      </AuthShell>
    );
  }

  if (state === "error") {
    return (
      <AuthShell
        title="No se pudo verificar el correo"
        description="El enlace puede haber vencido o ya fue utilizado. Inicia sesión y solicita un nuevo enlace de verificación."
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <MailWarning aria-hidden="true" size={30} />
        </div>
        <Link className={buttonStyles("primary", "w-full")} href="/login">
          Ir al login
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Verificando correo" description="Estamos confirmando tu correo para preparar tu acceso al sistema.">
      <p className="rounded-md bg-primary-soft p-3 text-center text-sm font-medium text-primary">Un momento, por favor...</p>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
