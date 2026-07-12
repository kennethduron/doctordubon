"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import { approveUser, disableUser, enableUser, getUsersByClinic, updateUserRole } from "@/lib/users";
import { canApproveUsers, canAssignRoles, canDisableUsers, canEnableUsers, roleLabels } from "@/lib/roles";
import { formatDate } from "@/lib/utils";
import type { Role } from "@/types/role";
import type { UserProfile, UserStatus } from "@/types/user";

const statusLabels: Record<UserStatus, string> = {
  active: "Activo",
  pending: "Pendiente",
  disabled: "Deshabilitado",
};

const statusGroups: Array<{
  status: UserStatus;
  title: string;
  description: string;
  emptyMessage: string;
}> = [
  {
    status: "pending",
    title: "Solicitudes pendientes",
    description: "Usuarios que solicitaron acceso al sistema y esperan aprobación.",
    emptyMessage: "No hay solicitudes pendientes.",
  },
  {
    status: "active",
    title: "Usuarios activos",
    description: "Personas con acceso habilitado al sistema.",
    emptyMessage: "No hay usuarios activos.",
  },
  {
    status: "disabled",
    title: "Usuarios deshabilitados",
    description: "Cuentas sin acceso activo al sistema.",
    emptyMessage: "No hay usuarios deshabilitados.",
  },
];

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "business_owner", label: "Dueño operativo" },
  { value: "admin", label: "Administrador" },
  { value: "technical_owner", label: "Técnico operativo" },
];

function statusBadgeVariant(status: UserStatus) {
  if (status === "active") return "income";
  if (status === "disabled") return "expense";
  return "primary";
}

function canCurrentUserApproveTarget(currentRole: Role | null, targetRole: Role) {
  return currentRole === "technical_owner" || (currentRole === "business_owner" && targetRole === "admin");
}

function canCurrentUserDisableTarget(currentRole: Role | null, targetRole: Role) {
  return currentRole === "technical_owner" || (currentRole === "business_owner" && targetRole === "admin");
}

function canCurrentUserEnableTarget(currentRole: Role | null, targetRole: Role) {
  return currentRole === "technical_owner" || (currentRole === "business_owner" && targetRole === "admin");
}

export function UsersTable() {
  const { role, userProfile, refreshUserProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null);
  const canApprove = canApproveUsers(role);
  const canDisable = canDisableUsers(role);
  const canEnable = canEnableUsers(role);
  const canAssign = canAssignRoles(role);

  const loadUsers = useCallback(async () => {
    if (!userProfile?.clinicId || userProfile.status !== "active") {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUsersByClinic(userProfile.clinicId, userProfile);
      setUsers(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  async function runUserAction(userId: string, action: () => Promise<void>, successMessage: string) {
    if (!userProfile) return;

    setSavingUserId(userId);
    setMessage(null);
    setError(null);

    try {
      await action();
      await loadUsers();
      if (userId === userProfile.id) {
        await refreshUserProfile();
      }
      setMessage(successMessage);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "No se pudo completar la acción.");
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleApprove(user: UserProfile) {
    if (!userProfile) return;
    await runUserAction(user.id, () => approveUser(user.id, userProfile), "Usuario aprobado correctamente.");
  }

  async function handleDisable(user: UserProfile) {
    if (!userProfile) return;
    await runUserAction(user.id, () => disableUser(user.id, userProfile), "Usuario deshabilitado correctamente.");
  }

  async function handleEnable(user: UserProfile) {
    if (!userProfile) return;
    await runUserAction(user.id, () => enableUser(user.id, userProfile), "Usuario habilitado correctamente.");
  }

  async function handleRoleChange(user: UserProfile, nextRole: Role) {
    if (!userProfile || user.role === nextRole) return;
    await runUserAction(user.id, () => updateUserRole(user.id, nextRole, userProfile), "Rol actualizado correctamente.");
  }

  function getActionState(user: UserProfile) {
    const actionDisabled = savingUserId === user.id;
    const isCurrentUser = user.id === userProfile?.id;
    const protectsSelf = isCurrentUser && (user.role === "technical_owner" || user.role === "business_owner");
    const canApproveTarget = canApprove
      && user.status === "pending"
      && canCurrentUserApproveTarget(role, user.role);
    const canDisableTarget = !protectsSelf
      && canDisable
      && user.status === "active"
      && canCurrentUserDisableTarget(role, user.role);
    const canEnableTarget = canEnable
      && user.status === "disabled"
      && canCurrentUserEnableTarget(role, user.role);

    return { actionDisabled, protectsSelf, canApproveTarget, canDisableTarget, canEnableTarget };
  }

  function renderRole(user: UserProfile, mobile = false) {
    const { actionDisabled, protectsSelf } = getActionState(user);

    if (!canAssign || protectsSelf) {
      return mobile ? (
        <div>
          <p className="text-xs font-medium text-slate-500">Rol</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{roleLabels[user.role]}</p>
        </div>
      ) : (
        <span className="font-medium text-slate-700">{roleLabels[user.role]}</span>
      );
    }

    return (
      <Select
        id={`${mobile ? "mobile-" : ""}role-${user.id}`}
        aria-label={mobile ? undefined : "Cambiar rol"}
        label={mobile ? "Rol" : undefined}
        options={roleOptions}
        value={user.role}
        disabled={actionDisabled}
        onChange={(event) => void handleRoleChange(user, event.target.value as Role)}
      />
    );
  }

  function renderActions(user: UserProfile) {
    const { actionDisabled, canApproveTarget, canDisableTarget, canEnableTarget } = getActionState(user);

    return (
      <div className="flex flex-wrap gap-2">
        {canApproveTarget ? (
          <Button type="button" variant="secondary" disabled={actionDisabled} onClick={() => void handleApprove(user)}>
            {actionDisabled ? "Guardando..." : "Aprobar acceso"}
          </Button>
        ) : null}
        {canDisableTarget ? (
          <Button type="button" variant="secondary" disabled={actionDisabled} onClick={() => void handleDisable(user)}>
            {actionDisabled ? "Guardando..." : "Deshabilitar"}
          </Button>
        ) : null}
        {canEnableTarget ? (
          <Button type="button" variant="secondary" disabled={actionDisabled} onClick={() => void handleEnable(user)}>
            {actionDisabled ? "Guardando..." : "Habilitar"}
          </Button>
        ) : null}
        <Button type="button" variant="subtle" disabled={actionDisabled} onClick={() => setDetailUser(user)}>
          Ver detalle
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del consultorio</CardTitle>
          <CardDescription>Revisa solicitudes, accesos habilitados y cuentas deshabilitadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? <p className="mb-4 rounded-md bg-mint p-3 text-sm font-medium text-mint-strong">{message}</p> : null}
          {error ? <p className="mb-4 rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
          {loading ? <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando usuarios...</p> : null}

          {!loading && users.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-soft bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No hay usuarios registrados.</p>
              <p className="mt-1 text-sm text-slate-500">Cuando alguien solicite acceso, aparecerá aquí para revisión.</p>
            </div>
          ) : null}

          {!loading && users.length > 0 ? (
            <div className="grid gap-6">
              {statusGroups.map((group) => {
                const groupUsers = users.filter((user) => user.status === group.status);

                return (
                  <section key={group.status} className="overflow-hidden rounded-lg border border-border-soft">
                    <div className="flex flex-col gap-2 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-950">{group.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{group.description}</p>
                      </div>
                      <Badge variant={statusBadgeVariant(group.status)}>{groupUsers.length}</Badge>
                    </div>

                    {group.status === "pending" && role === "business_owner" && groupUsers.length > 0 ? (
                      <p className="border-t border-border-soft bg-white px-4 py-3 text-sm text-slate-600">Al aprobar una solicitud, el acceso quedará habilitado como Administrador.</p>
                    ) : null}

                    {groupUsers.length === 0 ? (
                      <p className="px-4 py-5 text-sm text-slate-500">{group.emptyMessage}</p>
                    ) : (
                      <>
                        <div className="hidden overflow-x-auto lg:block">
                          <Table>
                            <thead>
                              <tr>
                                <Th>Nombre</Th>
                                <Th>Usuario</Th>
                                <Th>Correo</Th>
                                <Th>Rol</Th>
                                <Th>Estado</Th>
                                <Th>Fecha de creación</Th>
                                <Th>Acciones disponibles</Th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupUsers.map((user) => (
                                <tr key={user.id}>
                                  <Td className="font-medium text-slate-900">{user.name}</Td>
                                  <Td className="font-medium text-primary">@{user.username}</Td>
                                  <Td>{user.email}</Td>
                                  <Td>{renderRole(user)}</Td>
                                  <Td><Badge variant={statusBadgeVariant(user.status)}>{statusLabels[user.status]}</Badge></Td>
                                  <Td>{formatDate(user.createdAt)}</Td>
                                  <Td>{renderActions(user)}</Td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>

                        <div className="grid gap-3 p-3 lg:hidden">
                          {groupUsers.map((user) => (
                            <article key={user.id} className="rounded-md border border-border-soft bg-white p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                  <p className="mt-1 text-xs font-semibold text-primary">@{user.username}</p>
                                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                                </div>
                                <Badge variant={statusBadgeVariant(user.status)}>{statusLabels[user.status]}</Badge>
                              </div>
                              <div className="mt-4 grid gap-3">
                                {renderRole(user, true)}
                                <p className="text-xs text-slate-500">Creado: {formatDate(user.createdAt)}</p>
                                {renderActions(user)}
                              </div>
                            </article>
                          ))}
                        </div>
                      </>
                    )}
                  </section>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {detailUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-lg border border-border-soft bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Detalle del usuario</h2>
                <p className="mt-1 text-sm text-slate-500">Información de acceso al sistema.</p>
              </div>
              <Badge variant={statusBadgeVariant(detailUser.status)}>{statusLabels[detailUser.status]}</Badge>
            </div>
            <dl className="mt-5 grid gap-3 text-sm text-slate-700">
              <div><dt className="font-semibold text-slate-900">Nombre</dt><dd>{detailUser.name}</dd></div>
              <div><dt className="font-semibold text-slate-900">Usuario</dt><dd>@{detailUser.username}</dd></div>
              <div><dt className="font-semibold text-slate-900">Correo</dt><dd>{detailUser.email}</dd></div>
              <div><dt className="font-semibold text-slate-900">Rol</dt><dd>{roleLabels[detailUser.role]}</dd></div>
              <div><dt className="font-semibold text-slate-900">Fecha de creación</dt><dd>{formatDate(detailUser.createdAt)}</dd></div>
            </dl>
            <div className="mt-5 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setDetailUser(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
