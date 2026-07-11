'use client';

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
    <header className={'flex flex-col gap-4 border-b border-border-soft bg-background px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl'}>{title}</h1>
        <p className={'mt-1 text-sm text-slate-500'}>{subtitle}</p>
      </div>

      <div className={'flex flex-wrap items-center gap-3'}>
        <button
          className={'min-h-10 cursor-not-allowed rounded-md border border-border-soft bg-slate-50 px-3 text-xs font-semibold text-slate-500'}
          type={'button'}
          aria-label={'Notificaciones próximamente'}
          title={'Notificaciones próximamente'}
          disabled
        >
          Notificaciones próximamente
        </button>
        <div className={'flex items-center gap-3 rounded-md border border-border-soft bg-white px-3 py-2'}>
          <div className={'flex h-8 w-8 items-center justify-center rounded-md bg-primary-soft text-xs font-bold text-primary'}>
            {getInitials(displayName)}
          </div>
          <div className={'hidden text-left sm:block'}>
            <p className={'text-sm font-semibold text-slate-900'}>{displayName}</p>
            <p className={'text-xs text-slate-500'}>{visibleRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
