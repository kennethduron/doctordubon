"use client";

import Link from "next/link";
import { CheckCircle2, KeyRound, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, buttonStyles } from "@/components/ui/button";
import { auth, getFirebaseErrorLogDetails, getFirebaseErrorMessage } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

type ResetState = "checking" | "ready" | "success" | "error";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const [state, setState] = useState<ResetState>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkCode() {
      if (!oobCode) {
        setState("error");
        return;
      }

      try {
        const accountEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(accountEmail);
        setState("ready");
      } catch (error) {
        console.error("Password reset error:", getFirebaseErrorLogDetails(error));
        setState("error");
      }
    }

    void checkCode();
  }, [oobCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!oobCode) {
      setState("error");
      return;
    }

    if (!password || !confirmPassword) {
      setMessage("Ingresa y confirma tu nueva contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setState("success");
    } catch (error) {
      console.error("Password reset error:", getFirebaseErrorLogDetails(error));
      setMessage(getFirebaseErrorMessage(error, "No se pudo restablecer la contraseña. Solicita un nuevo enlace."));
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "success") {
    return (
      <AuthShell title="Contraseña actualizada" description="Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.">
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
      <AuthShell title="Enlace no disponible" description="El enlace puede haber vencido o ya fue utilizado. Solicita un nuevo enlace para restablecer tu contraseña.">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <TriangleAlert aria-hidden="true" size={30} />
        </div>
        <Link className={buttonStyles("primary", "w-full")} href="/recuperar-contrasena">
          Solicitar nuevo enlace
        </Link>
      </AuthShell>
    );
  }

  if (state === "checking") {
    return (
      <AuthShell title="Revisando enlace" description="Estamos verificando que el enlace de recuperación siga disponible.">
        <p className="rounded-md bg-primary-soft p-3 text-center text-sm font-medium text-primary">Un momento, por favor...</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nueva contraseña" description="Ingresa una contraseña nueva para tu cuenta del Centro Financiero del Consultorio.">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <KeyRound aria-hidden="true" size={28} />
      </div>
      <p className="mb-4 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cuenta: {email}</p>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <PasswordInput
          id="new-password"
          label="Nueva contraseña"
          autoComplete="new-password"
          value={password}
          required
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          id="confirm-new-password"
          label="Confirmar contraseña"
          autoComplete="new-password"
          value={confirmPassword}
          required
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {message ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{message}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Guardando..." : "Restablecer contraseña"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
