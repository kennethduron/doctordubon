import { Bell, CheckCircle2, CircleDollarSign, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationSeverity, NotificationType } from "@/types/notification";

const severityVariant: Record<NotificationSeverity, "neutral" | "income" | "expense" | "primary"> = {
  info: "primary",
  success: "income",
  warning: "neutral",
  danger: "expense",
};

function getNotificationIcon(type: NotificationType) {
  const className = "h-4 w-4";

  if (type === "access_request") return <UserPlus className={className} aria-hidden="true" />;
  if (type === "user_approved") return <CheckCircle2 className={className} aria-hidden="true" />;
  if (type === "income_created" || type === "expense_created") return <CircleDollarSign className={className} aria-hidden="true" />;
  if (type === "movement_deleted") return <Trash2 className={className} aria-hidden="true" />;
  if (type === "daily_review") return <ShieldCheck className={className} aria-hidden="true" />;
  return <Bell className={className} aria-hidden="true" />;
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  return new Intl.DateTimeFormat("es-HN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

type NotificationItemProps = {
  notification: AppNotification;
  unread: boolean;
  onRead: (notificationId: string) => void;
};

export function NotificationItem({ notification, unread, onRead }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);

  return (
    <button
      type="button"
      className={cn(
        "grid w-full grid-cols-[auto_1fr] gap-3 rounded-md border border-border-soft p-3 text-left transition hover:bg-slate-50",
        unread ? "bg-primary-soft/55" : "bg-white",
      )}
      onClick={() => onRead(notification.id)}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-border-soft">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-start justify-between gap-3">
          <span className="text-sm font-semibold text-slate-950">{notification.title}</span>
          {unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="No leída" /> : null}
        </span>
        <span className="mt-1 block text-sm leading-5 text-slate-600">{notification.message}</span>
        <span className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{formatNotificationDate(notification.createdAt)}</span>
          <Badge variant={severityVariant[notification.severity]}>{unread ? "Nueva" : "Leída"}</Badge>
        </span>
      </span>
    </button>
  );
}
