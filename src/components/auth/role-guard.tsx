'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import type { Role } from '@/types/role';

type RoleGuardProps = {
  allowedRoles: Role[];
  children: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return (
      <main className={'flex min-h-screen items-center justify-center bg-background px-4 py-10'}>
        <Card className={'w-full max-w-lg'}>
          <CardHeader>
            <CardTitle>No tienes permiso para acceder a esta sección.</CardTitle>
            <CardDescription>
              Tu perfil no cuenta con los permisos necesarios. Contacta al encargado del sistema si necesitas acceso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={'text-sm text-slate-600'}>Puedes continuar utilizando las secciones disponibles en el menú principal.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
