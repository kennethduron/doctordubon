import { AppShell } from "@/components/layout/app-shell";
import { UsersPermissionOverview } from "@/components/users/users-permission-overview";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <AppShell
      title="Usuarios y permisos"
      subtitle="Administra solicitudes de acceso y cuentas del personal."
      allowedRoles={["technical_owner", "business_owner"]}
    >
      <UsersPermissionOverview />

      <div className="mt-6">
        <UsersTable />
      </div>
    </AppShell>
  );
}
