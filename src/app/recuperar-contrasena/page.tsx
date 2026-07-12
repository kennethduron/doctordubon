"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getFirebaseErrorCode } from "@/lib/firebase";

const neutralSuccessMessage =
  "Si el correo existe, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada, spam o promociones.";

function getPasswordResetMessage(error: unknown) {
  const code = getFirebaseErrorCode(error);

  if (code === "auth/user-not-found") return neutralSuccessMessage;
  if (code === "auth/invalid-email") return "Ingresa un correo electrónico válido.";
  if (code === "auth/too-many-requests") {
    return "Se realizaron demasiados intentos. Espera unos minutos antes de intentarlo nuevamente.";
  }
  if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
    return "No se pudo enviar el enlace en este momento. Contacta al encargado del sistema.";
  }

  return "No se pudo enviar el enlace en este momento. Intenta nuevamente más tarde.";
}

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Ingrese el correo registrado para enviar el enlace de recuperación.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(email.trim());
      setSuccess(neutralSuccessMessage);
    } catch (resetError) {
      const message = getPasswordResetMessage(resetError);

      if (message === neutralSuccessMessage) {
        setSuccess(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      eyebrow={APP_NAME}
      description="Ingresa tu correo y te enviaremos un enlace para recuperar tu contraseña."
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          id="recover-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        />
        {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
        {success ? <p className="rounded-md bg-mint p-3 text-sm leading-6 font-medium text-mint-strong">{success}</p> : null}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>
      </form>
      <Link className="mt-5 block text-center text-sm font-semibold text-primary hover:underline" href="/login">
        Volver a iniciar sesión
      </Link>
    </AuthShell>
  );
}
