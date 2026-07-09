"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerWithEmail, logout as firebaseLogout } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getFirebaseErrorMessage } from "@/lib/firebase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Complete todos los campos para crear la cuenta.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      await firebaseLogout();
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Cuenta creada correctamente. Revise su correo para verificarlo. La cuenta puede requerir aprobación antes de acceder.");
    } catch (registerError) {
      setError(getFirebaseErrorMessage(registerError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">CF</div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-500">{APP_NAME}</p>
        </div>

        <Card>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input id="name" label="Nombre completo" placeholder="Nombre y apellido" value={name} onChange={(event) => setName(event.target.value)} />
              <Input id="email" label="Correo" type="email" autoComplete="email" placeholder="correo@ejemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input id="password" label="Contraseña" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Input id="confirm-password" label="Confirmar contraseña" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
              {success ? <p className="rounded-md bg-mint p-3 text-sm font-medium text-mint-strong">{success}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
            <p className="mt-4 rounded-md bg-primary-soft p-3 text-sm leading-6 text-primary">
              La cuenta inicia como Administrador pendiente de aprobación. El Técnico operativo puede ajustar permisos críticos posteriormente.
            </p>
            <Link className="mt-5 block text-center text-sm font-semibold text-primary" href="/login">Volver a iniciar sesión</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

