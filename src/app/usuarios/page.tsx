import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleCard } from "@/components/users/role-card";
import { UsersTable } from "@/components/users/users-table";
import { mockUsers } from "@/data/mock-data";
import { roleRules } from "@/lib/constants";

export default function UsersPage() {
  return (
    <AppShell title="Usuarios y permisos" subtitle="Estructura de acceso por roles del consultorio.">
      <div className="grid gap-5 md:grid-cols-3">
        {roleRules.map((rule) => (
          <RoleCard key={rule.role} rule={rule} />
        ))}
      </div>

      <div className="mt-6">
        <UsersTable users={mockUsers} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reglas críticas</CardTitle>
          <CardDescription>Restricciones que deben mantenerse al conectar administración real en Firestore.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-6 text-slate-600">
          <p>El Administrador puede registrar movimientos y consultar reportes, pero no puede asignar roles.</p>
          <p>El Dueño operativo no puede eliminar ni quitar permisos al Técnico operativo.</p>
          <p>Solo el Técnico operativo puede manejar configuraciones técnicas críticas.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

