"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { getFirebaseErrorMessage } from "@/lib/firebase";
import { sendVerificationEmailIfNeeded } from "@/lib/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function CenteredMessage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, profileError, loading, isAuthenticated, logout, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verifiedUidAfterReload, setVerifiedUidAfterReload] = useState<string | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [retryingProfile, setRetryingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <CenteredMessage title="Cargando sesión" description="Estamos verificando su acceso al sistema financiero.">
        <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
      </CenteredMessage>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isEmailVerified = user.emailVerified || verifiedUidAfterReload === user.uid;

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  async function handleSendVerification() {
    if (!user) return;

    setSendingVerification(true);
    setVerificationMessage(null);

    try {
      await sendVerificationEmailIfNeeded(user);
      setVerificationMessage("Enlace de verificación enviado. Revisa tu correo, spam o promociones.");
    } catch (error) {
      setVerificationMessage(
        getFirebaseErrorMessage(error, "No se pudo enviar el correo de verificación. Intenta nuevamente."),
      );
    } finally {
      setSendingVerification(false);
    }
  }

  async function handleCheckVerification() {
    if (!user) return;

    setCheckingVerification(true);
    setVerificationMessage(null);

    try {
      await user.reload();

      if (user.emailVerified) {
        setVerifiedUidAfterReload(user.uid);
        setVerificationMessage("Correo verificado correctamente. Cargando tu acceso...");
        await refreshUserProfile();
        router.refresh();
        return;
      }

      setVerificationMessage("Tu correo todavía no aparece como verificado. Abre el enlace enviado por Firebase e intenta nuevamente.");
    } catch (error) {
      setVerificationMessage(
        getFirebaseErrorMessage(error, "No se pudo actualizar el estado de verificación. Intenta nuevamente."),
      );
    } finally {
      setCheckingVerification(false);
    }
  }

  async function handleRetryProfile() {
    setRetryingProfile(true);
    await refreshUserProfile();
    setRetryingProfile(false);
  }

  if (profileError) {
    return (
      <CenteredMessage title={"No se pudo cargar tu perfil"} description={profileError}>
        <div className={"flex flex-col gap-3 sm:flex-row"}>
          <Button type={"button"} onClick={handleRetryProfile} disabled={retryingProfile}>
            {retryingProfile ? "Reintentando..." : "Reintentar"}
          </Button>
          <Button type={"button"} variant={"secondary"} onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </CenteredMessage>
    );
  }

  if (!isEmailVerified) {
    return (
      <CenteredMessage
        title="Verifique su correo"
        description="Antes de entrar al sistema debe confirmar el correo asociado a su cuenta."
      >
        <div className="grid gap-4">
          <p className="rounded-md bg-primary-soft p-4 text-sm leading-6 text-primary">
            Revise el correo {user.email}. Si no encuentra el mensaje, revise spam o promociones, o solicite otro enlace.
          </p>
          {verificationMessage ? <p className="text-sm font-medium text-slate-700">{verificationMessage}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={handleSendVerification} disabled={sendingVerification || checkingVerification}>
              {sendingVerification ? "Enviando..." : "Reenviar verificación"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCheckVerification} disabled={checkingVerification || sendingVerification}>
              {checkingVerification ? "Verificando..." : "Ya verifiqué mi correo"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </CenteredMessage>
    );
  }

  if (userProfile?.status === "disabled") {
    return (
      <CenteredMessage
        title="Cuenta deshabilitada"
        description="Esta cuenta no tiene acceso al sistema. Contacte al Técnico operativo o al Dueño operativo."
      >
        <Button type="button" variant="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </CenteredMessage>
    );
  }

  if (userProfile?.status === "pending") {
    return (
      <CenteredMessage
        title="Cuenta pendiente de aprobación"
        description="Tu cuenta está pendiente de aprobación. Un Técnico operativo debe activar tu acceso."
      >
        <div className="grid gap-4">
          <p className="rounded-md bg-primary-soft p-4 text-sm leading-6 text-primary">
            Si crees que esto es un error, contacta al encargado del sistema.
          </p>
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </CenteredMessage>
    );
  }

  return <>{children}</>;
}
