"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getFirebaseErrorMessage } from "@/lib/firebase";

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
      setSuccess("Si el correo existe, recibirás un enlace para restablecer tu contraseña.");
    } catch (resetError) {
      setError(getFirebaseErrorMessage(resetError));
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
