"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLoading } from "@/components/ui/app-loading";
import { useAuth } from "@/context/auth-context";
import { loginWithEmail } from "@/lib/auth";
import { APP_NAME, CLINIC_NAME } from "@/lib/constants";
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

  if (loading || isAuthenticated) {
    return <AppLoading />;
  }

  return (
    <AuthShell
      title={APP_NAME}
      description="Ingresa para administrar ingresos, gastos y reportes del consultorio."
      footer={CLINIC_NAME}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordInput
          id="password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Ingrese su contraseña"
          value={password}
          required
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>

      <div className="mt-6 grid gap-3 border-t border-border-soft pt-5 text-center text-sm">
        <Link className="font-semibold text-primary hover:underline" href="/recuperar-contrasena">
          ¿Olvidaste tu contraseña?
        </Link>
        <p className="text-slate-600">
          ¿Necesitas acceso?{" "}
          <Link className="font-semibold text-primary hover:underline" href="/registro">Crear cuenta</Link>
        </p>
      </div>
    </AuthShell>
  );
}
