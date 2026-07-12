'use client';

import { ChevronDown } from 'lucide-react';
import { NotificationsPopover } from '@/components/notifications/notifications-popover';
import { useAuth } from '@/context/auth-context';
import { roleLabels } from '@/lib/roles';

type TopbarProps = {
  title: string;
  subtitle: string;
};

function getInitials(name?: string | null) {
  if (!name) return 'CF';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CF';
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user, userProfile, role } = useAuth();
  const displayName = userProfile?.name ?? user?.displayName ?? 'Usuario';
  const visibleRole = role ? roleLabels[role] : 'Usuario autorizado';

  return (
    <header className={'sticky top-0 z-30 hidden border-b border-border-soft bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(15,58,95,0.05)] backdrop-blur-xl sm:px-6 lg:block'}>
      <div className={'mx-auto flex w-full max-w-[1500px] items-center justify-between gap-5'}>
        <div className={'min-w-0'}>
          <h1 className={'truncate text-2xl font-bold tracking-normal text-slate-950'}>{title}</h1>
          <p className={'mt-1 truncate text-sm text-slate-500'}>{subtitle}</p>
        </div>

        <div className={'flex shrink-0 items-center gap-3'}>
          <NotificationsPopover />
          <div className={'flex min-h-11 items-center gap-3 rounded-lg border border-border-soft bg-white px-3 py-2 shadow-sm'}>
            <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary'}>
              {getInitials(displayName)}
            </div>
            <div className={'hidden min-w-0 text-left xl:block'}>
              <p className={'max-w-56 truncate text-sm font-semibold text-slate-900'}>{displayName}</p>
              <p className={'text-xs text-slate-500'}>{visibleRole}</p>
            </div>
            <ChevronDown className={'hidden h-4 w-4 text-slate-400 xl:block'} />
          </div>
        </div>
      </div>
    </header>
  );
}