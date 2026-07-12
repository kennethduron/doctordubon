"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  getNotificationsForCurrentUser,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

type NotificationsPopoverProps = {
  compact?: boolean;
};

export function NotificationsPopover({ compact = false }: NotificationsPopoverProps) {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = userProfile ? getUnreadNotificationsCount(notifications, userProfile.id) : 0;

  const loadNotifications = useCallback(async () => {
    if (!userProfile || userProfile.status !== "active") {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getNotificationsForCurrentUser(userProfile);
      setNotifications(result);
    } catch {
      setError("No se pudieron cargar tus notificaciones.");
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  }

  async function handleRead(notificationId: string) {
    if (!userProfile) return;

    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.readBy.includes(userProfile.id)) return;

    setNotifications((current) => current.map((item) => (
      item.id === notificationId ? { ...item, readBy: [...item.readBy, userProfile.id] } : item
    )));

    try {
      await markNotificationAsRead(notificationId, userProfile.id);
    } catch {
      await loadNotifications();
    }
  }

  async function handleReadAll() {
    if (!userProfile || unreadCount === 0) return;

    const previousNotifications = notifications;
    setNotifications((current) => current.map((item) => (
      item.readBy.includes(userProfile.id) ? item : { ...item, readBy: [...item.readBy, userProfile.id] }
    )));

    try {
      await markAllNotificationsAsRead(previousNotifications, userProfile.id);
    } catch {
      await loadNotifications();
    }
  }

  return (
    <div className="relative">
      <button
        className={cn(
          "relative inline-flex min-h-11 items-center gap-3 rounded-lg border border-border-soft bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50",
          compact ? "h-10 w-10 justify-center rounded-full px-0" : "px-4",
        )}
        type="button"
        aria-label="Abrir notificaciones"
        aria-expanded={open}
        onClick={handleToggle}
      >
        <span className={cn("flex items-center justify-center bg-primary-soft text-primary", compact ? "h-10 w-10 rounded-full" : "h-8 w-8 rounded-full")}>
          <Bell className="h-4 w-4" />
        </span>
        {!compact ? <span>Notificaciones</span> : null}
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className={cn(
          "absolute right-0 top-12 z-50 w-[min(92vw,380px)] rounded-lg border border-border-soft bg-white p-3 shadow-xl shadow-slate-900/15",
          compact ? "right-[-3.25rem] sm:right-0" : "",
        )}>
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-border-soft pb-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Centro de notificaciones</p>
              <p className="mt-1 text-xs text-slate-500">Actualizaciones importantes del consultorio.</p>
            </div>
            <Button type="button" variant="subtle" className="min-h-8 px-2 py-1 text-xs" disabled={unreadCount === 0} onClick={handleReadAll}>
              Marcar todas como leídas
            </Button>
          </div>

          {loading ? <p className="rounded-md bg-primary-soft p-3 text-sm font-medium text-primary">Cargando notificaciones...</p> : null}
          {error ? <p className="rounded-md bg-danger-soft p-3 text-sm font-medium text-danger">{error}</p> : null}
          {!loading && !error && notifications.length === 0 ? (
            <p className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">No tienes notificaciones por ahora.</p>
          ) : null}
          {!loading && !error && notifications.length > 0 ? (
            <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  unread={Boolean(userProfile && !notification.readBy.includes(userProfile.id))}
                  onRead={handleRead}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
