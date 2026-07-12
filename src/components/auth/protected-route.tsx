"use client";

import { MailCheck, ShieldCheck, UserRoundX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { AppLoading } from "@/components/ui/app-loading";
import { useAuth } from "@/context/auth-context";
import { sendVerificationEmailIfNeeded } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { getFirebaseErrorMessage } from "@/lib/firebase";

type ProtectedRouteProps = {
  children: ReactNode;
};

function CenteredMessage({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AuthShell title={title} eyebrow={APP_NAME} description={description}>
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon}
      </div>
      {children}
    </AuthShell>
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
    return <AppLoading />;
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
        setVerificationMessage("Correo verificado correctamente. Preparando tu acceso...");
        await refreshUserProfile();
        router.refresh();
        return;
      }

      setVerificationMessage("Tu correo todavía no aparece como verificado. Abre el enlace recibido e intenta nuevamente.");
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
      <CenteredMessage
        title="No se pudo cargar tu perfil"
        description="Intenta nuevamente o contacta al encargado del sistema."
        icon={<UserRoundX aria-hidden="true" size={28} />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={handleRetryProfile} disabled={retryingProfile}>
            {retryingProfile ? "Reintentando..." : "Reintentar"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
        </div>
      </CenteredMessage>
    );
  }

  if (!isEmailVerified) {
    return (
      <CenteredMessage
        title="Verifica tu correo"
        description="Antes de ingresar al sistema, debes verificar el correo asociado a tu cuenta. Revisa tu bandeja de entrada, spam o promociones."
        icon={<MailCheck aria-hidden="true" size={28} />}
      >
        <div className="grid gap-4">
          <div className="rounded-lg bg-primary-soft p-4 text-sm leading-6 text-primary">
            <p>Enviamos el enlace a <strong>{user.email}</strong>.</p>
            <p className="mt-2">Si el enlace venció, solicita uno nuevo desde esta pantalla.</p>
          </div>
          {verificationMessage ? (
            <p className="rounded-md border border-border-soft bg-slate-50 p-3 text-sm font-medium text-slate-700">
              {verificationMessage}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={handleSendVerification} disabled={sendingVerification || checkingVerification}>
              {sendingVerification ? "Enviando..." : "Reenviar verificación"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCheckVerification} disabled={checkingVerification || sendingVerification}>
              {checkingVerification ? "Verificando..." : "Ya verifiqué mi correo"}
            </Button>
          </div>
          <Button type="button" variant="subtle" onClick={handleLogout}>Cerrar sesión</Button>
        </div>
      </CenteredMessage>
    );
  }

  if (userProfile?.status === "disabled") {
    return (
      <CenteredMessage
        title="Cuenta deshabilitada"
        description="Esta cuenta no tiene acceso activo. Contacta al Técnico operativo o al Dueño operativo."
        icon={<UserRoundX aria-hidden="true" size={28} />}
      >
        <Button type="button" className="w-full" variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
      </CenteredMessage>
    );
  }

  if (userProfile?.status === "pending") {
    return (
      <CenteredMessage
        title="Cuenta pendiente de aprobación"
        description="Tu cuenta está pendiente de aprobación. El Técnico operativo o el Dueño operativo debe activar tu acceso antes de ingresar al sistema."
        icon={<ShieldCheck aria-hidden="true" size={28} />}
      >
        <div className="grid gap-4">
          <p className="rounded-lg bg-primary-soft p-4 text-sm leading-6 text-primary">
            Cuando tu acceso sea aprobado, podrás iniciar sesión normalmente.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={handleRetryProfile} disabled={retryingProfile}>
              {retryingProfile ? "Reintentando..." : "Reintentar"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        </div>
      </CenteredMessage>
    );
  }

  return <>{children}</>;
}
