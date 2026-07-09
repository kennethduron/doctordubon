"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";
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
      setSuccess("Enviamos un enlace de recuperación al correo indicado.");
    } catch (resetError) {
      setError(getFirebaseErrorMessage(resetError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">CF</div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-slate-500">Enviaremos un enlace de recuperación al correo registrado.</p>
        </div>

        <Card>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input id="recover-email" label="Correo" type="email" autoComplete="email" placeholder="correo@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
              {success ? <p className="rounded-md bg-mint p-3 text-sm font-medium text-mint-strong">{success}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
            <Link className="mt-5 block text-center text-sm font-semibold text-primary" href="/login">Volver a iniciar sesión</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

