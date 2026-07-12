"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleCard } from "@/components/users/role-card";
import { useAuth } from "@/context/auth-context";
import { roleRules } from "@/lib/constants";

export function UsersPermissionOverview() {
  const { role } = useAuth();

  if (role === "technical_owner") {
    return (
      <>
        <div className="grid gap-5 md:grid-cols-3">
          {roleRules.map((rule) => (
            <RoleCard key={rule.role} rule={rule} />
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reglas críticas</CardTitle>
            <CardDescription>Restricciones de seguridad para proteger el acceso al sistema.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-slate-600">
            <p>El Administrador puede registrar movimientos y consultar reportes, pero no puede aprobar usuarios ni asignar roles.</p>
            <p>El Dueño operativo puede administrar cuentas de Administrador según las reglas activas del sistema.</p>
            <p>Solo el Técnico operativo puede asignar o modificar los roles de mayor acceso.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de accesos</CardTitle>
        <CardDescription>Aprueba solicitudes y administra las cuentas operativas del consultorio.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm leading-6 text-slate-600">
        <p>Las solicitudes pendientes aparecerán agrupadas para que puedas revisarlas con calma.</p>
        <p>Al aprobar una cuenta, el acceso quedará habilitado con permisos administrativos normales.</p>
      </CardContent>
    </Card>
  );
}
