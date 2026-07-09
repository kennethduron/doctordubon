"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { loginWithEmail } from "@/lib/auth";
import { APP_DESCRIPTION, APP_NAME, CLINIC_NAME } from "@/lib/constants";
import { getFirebaseErrorMessage } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Ingrese correo y contraseña para continuar.");
      return;
    }

    setSubmitting(true);

    try {
      await loginWithEmail(email.trim(), password);
      router.replace("/dashboard");
    } catch (loginError) {
      setError(getFirebaseErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">CF</div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">{APP_NAME}</h1>
          <p className="mt-2 text-sm font-medium text-primary">Dr. Oscar Dubon</p>
          <p className="mt-2 text-sm text-slate-500">{APP_DESCRIPTION}</p>
        </div>

        <Card>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input
                id="email"
                label="Correo"
                type="email"
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                id="password"
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="mt-5 grid gap-2 text-center text-sm">
              <Link className="font-semibold text-primary" href="/recuperar-contrasena">Recuperar contraseña</Link>
              <Link className="text-slate-600" href="/registro">Crear cuenta o solicitar acceso</Link>
            </div>
          </CardContent>
        </Card>
        <p className="mt-5 text-center text-xs text-slate-500">{CLINIC_NAME}</p>
      </section>
    </main>
  );
}

