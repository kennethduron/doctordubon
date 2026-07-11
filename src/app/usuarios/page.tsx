import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleCard } from '@/components/users/role-card';
import { UsersTable } from '@/components/users/users-table';
import { roleRules } from '@/lib/constants';

export default function UsersPage() {
  return (
    <AppShell
      title={'Usuarios y permisos'}
      subtitle={'Administración de accesos financieros del consultorio.'}
      allowedRoles={['technical_owner', 'business_owner']}
    >
      <div className={'grid gap-5 md:grid-cols-3'}>
        {roleRules.map((rule) => (
          <RoleCard key={rule.role} rule={rule} />
        ))}
      </div>

      <div className={'mt-6'}>
        <UsersTable />
      </div>

      <Card className={'mt-6'}>
        <CardHeader>
          <CardTitle>Reglas críticas</CardTitle>
          <CardDescription>Restricciones de seguridad para proteger el acceso al sistema.</CardDescription>
        </CardHeader>
        <CardContent className={'grid gap-3 text-sm leading-6 text-slate-600'}>
          <p>El Administrador puede registrar movimientos y consultar reportes, pero no puede aprobar usuarios ni asignar roles.</p>
          <p>El Dueño operativo puede aprobar o deshabilitar administradores, pero no puede modificar al Técnico operativo.</p>
          <p>Solo el Técnico operativo puede asignar o modificar roles críticos.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
