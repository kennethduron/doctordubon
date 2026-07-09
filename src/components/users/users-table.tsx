"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { canAssignRoles, roleLabels } from "@/lib/roles";
import type { UserProfile, UserStatus } from "@/types/user";

const statusLabels: Record<UserStatus, string> = {
  active: "Activo",
  pending: "Pendiente",
  disabled: "Deshabilitado",
};

function statusBadgeVariant(status: UserStatus) {
  if (status === "active") return "income";
  if (status === "disabled") return "expense";
  return "neutral";
}

export function UsersTable({ users }: { users: UserProfile[] }) {
  const { role } = useAuth();
  const canAssign = canAssignRoles(role);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del consultorio</CardTitle>
        <CardDescription>El Administrador puede registrar movimientos y consultar reportes, pero no puede asignar roles.</CardDescription>
      </CardHeader>
      <CardContent>
        {!canAssign ? (
          <p className="mb-4 rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">
            La asignación de roles está deshabilitada para su perfil actual. Solo el Técnico operativo puede modificar roles críticos.
          </p>
        ) : null}

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Correo</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <Td className="font-medium text-slate-900">{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{roleLabels[user.role]}</Td>
                  <Td><Badge variant={statusBadgeVariant(user.status)}>{statusLabels[user.status]}</Badge></Td>
                  <Td>
                    <button
                      type="button"
                      disabled={!canAssign}
                      className="rounded-md px-2 py-1 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {canAssign ? "Gestionar rol" : "Sin permiso"}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="grid gap-3 md:hidden">
          {users.map((user) => (
            <article key={user.id} className="rounded-md border border-border-soft bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </div>
                <Badge variant={statusBadgeVariant(user.status)}>{statusLabels[user.status]}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700">{roleLabels[user.role]}</p>
              <button
                type="button"
                disabled={!canAssign}
                className="mt-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {canAssign ? "Gestionar rol" : "Sin permiso para asignar roles"}
              </button>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
