'use client';

import { Bell, ChevronDown } from 'lucide-react';
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
    <header className={'flex flex-col gap-4 border-b border-border-soft bg-background/95 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl'}>{title}</h1>
        <p className={'mt-1 text-sm text-slate-500'}>{subtitle}</p>
      </div>

      <div className={'flex flex-wrap items-center gap-3'}>
        <button
          className={'inline-flex min-h-12 cursor-not-allowed items-center gap-3 rounded-lg border border-border-soft bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm'}
          type={'button'}
          aria-label={'Notificaciones próximamente'}
          title={'Notificaciones próximamente'}
          disabled
        >
          <span className={'flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary'}>
            <Bell className={'h-4 w-4'} />
          </span>
          Notificaciones próximamente
        </button>
        <div className={'flex min-h-12 items-center gap-3 rounded-lg border border-border-soft bg-white px-3 py-2 shadow-sm'}>
          <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary'}>
            {getInitials(displayName)}
          </div>
          <div className={'hidden text-left sm:block'}>
            <p className={'text-sm font-semibold text-slate-900'}>{displayName}</p>
            <p className={'text-xs text-slate-500'}>{visibleRole}</p>
          </div>
          <ChevronDown className={'hidden h-4 w-4 text-slate-400 sm:block'} />
        </div>
      </div>
    </header>
  );
}