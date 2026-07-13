"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getUsernameValidationMessage,
  normalizeUsername,
  registerWithEmail,
  logout as firebaseLogout,
} from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getFirebaseErrorMessage } from "@/lib/firebase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
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

    if (!name.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Complete todos los campos para crear la cuenta.");
      return;
    }

    const usernameError = getUsernameValidationMessage(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await registerWithEmail(name.trim(), username, email.trim(), password);
      await firebaseLogout();
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      if (result.verificationEmailSent) {
        setSuccess(
          "Cuenta creada correctamente. Te enviamos un correo de verificación. Después de verificarlo, tu acceso quedará pendiente de aprobación.",
        );
      } else {
        setError(
          "La cuenta fue creada, pero no se pudo enviar el correo de verificación. Inicia sesión para solicitar un enlace nuevo.",
        );
      }
    } catch (registerError) {
      setError(
        getFirebaseErrorMessage(
          registerError,
          "No se pudo crear la cuenta. Intenta nuevamente o contacta al encargado del sistema.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Crear cuenta"
      eyebrow={APP_NAME}
      description="Crea tu cuenta para solicitar acceso al Centro Financiero del Consultorio."
      wide
    >
      <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="name"
            label="Nombre completo"
            autoComplete="name"
            placeholder="Dr. Oscar Dubon"
            value={name}
            required
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            id="username"
            label="Usuario"
            autoComplete="username"
            placeholder="oscar.dubon"
            value={username}
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9._-]{3,30}"
            title="Usa entre 3 y 30 caracteres: letras, números y, opcionalmente, punto, guion bajo o guion medio."
            aria-describedby="username-help"
            required
            onChange={(event) => setUsername(normalizeUsername(event.target.value))}
          />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            id="password"
            label="Contraseña"
            autoComplete="new-password"
            value={password}
            required
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirmar contraseña"
            autoComplete="new-password"
            value={confirmPassword}
            required
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <p id="username-help" className="text-xs leading-5 text-slate-500">
          El usuario debe tener entre 3 y 30 caracteres. Puedes usar letras y números; el punto, guion bajo y guion medio son opcionales. Si escribes @ al inicio, se omitirá automáticamente.
        </p>
        {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
        {success ? <p className="rounded-md bg-mint p-3 text-sm leading-6 font-medium text-mint-strong">{success}</p> : null}
        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-5 rounded-md bg-primary-soft p-3 text-sm leading-6 text-primary">
        Después de verificar tu correo, un responsable del sistema deberá aprobar tu acceso.
      </p>
      <Link className="mt-5 block text-center text-sm font-semibold text-primary hover:underline" href="/login">
        Volver a iniciar sesión
      </Link>
    </AuthShell>
  );
}
