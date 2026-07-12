'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, HeartPulse, Home, LogOut, Menu, MoreHorizontal, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { NotificationsPopover } from '@/components/notifications/notifications-popover';
import { useAuth } from '@/context/auth-context';
import { APP_NAME, CLINIC_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getNavigationForRole } from './sidebar';

const primaryMobileItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/ingresos', label: 'Ingresos', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', icon: TrendingDown },
  { href: '/libro-diario', label: 'Libro diario', icon: BookOpen },
];

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role, userProfile, user } = useAuth();
  const displayName = userProfile?.name ?? user?.displayName ?? 'Usuario';

  async function handleLogout() {
    await logout();
    setMoreOpen(false);
    router.replace('/login');
  }

  const moreItems = getNavigationForRole(role).filter((item) => !primaryMobileItems.some((primary) => primary.href === item.href));

  return (
    <div className={'lg:hidden'}>
      <div className={'sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-soft bg-white/95 px-4 shadow-sm backdrop-blur-xl'}>
        <div className={'flex min-w-0 items-center gap-3'}>
          <button
            type={'button'}
            className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-soft bg-white text-primary shadow-sm'}
            aria-label={moreOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMoreOpen((current) => !current)}
          >
            {moreOpen ? <X className={'h-5 w-5'} /> : <Menu className={'h-5 w-5'} />}
          </button>
          <Link href={'/dashboard'} className={'flex min-w-0 items-center gap-2'} onClick={() => setMoreOpen(false)}>
            <span className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary'}>
              <HeartPulse className={'h-6 w-6'} />
            </span>
            <span className={'min-w-0'}>
              <span className={'block truncate text-sm font-bold text-primary'}>{APP_NAME}</span>
              <span className={'block truncate text-xs text-slate-500'}>{CLINIC_NAME}</span>
            </span>
          </Link>
        </div>
        <div className={'flex items-center gap-2'}>
          <NotificationsPopover compact />
          <div className={'flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary shadow-sm'} title={displayName}>
            {displayName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('') || 'CF'}
          </div>
        </div>
      </div>

      {moreOpen ? (
        <div className={'fixed inset-x-3 bottom-24 z-40 rounded-2xl border border-border-soft bg-white p-3 shadow-[0_20px_60px_rgba(15,58,95,0.18)]'}>
          <div className={'grid gap-2'}>
            {moreItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-semibold transition',
                    active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-700 hover:bg-primary-soft hover:text-primary',
                  )}
                >
                  <span>{item.label}</span>
                  <Icon className={'h-5 w-5'} />
                </Link>
              );
            })}
            <button
              type={'button'}
              onClick={handleLogout}
              className={'mt-1 flex min-h-12 items-center justify-between rounded-xl border border-border-soft px-3 text-sm font-semibold text-primary shadow-sm'}
            >
              Cerrar sesión
              <LogOut className={'h-5 w-5'} />
            </button>
          </div>
        </div>
      ) : null}

      <nav className={'fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_36px_rgba(15,58,95,0.10)] backdrop-blur-xl'}>
        <div className={'mx-auto grid max-w-lg grid-cols-5 gap-1'}>
          {primaryMobileItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition',
                  active ? 'bg-primary-soft text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-primary',
                )}
              >
                <Icon className={'h-5 w-5'} />
                <span className={'leading-none'}>{item.label}</span>
              </Link>
            );
          })}
          <button
            type={'button'}
            onClick={() => setMoreOpen((current) => !current)}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition',
              moreOpen ? 'bg-primary-soft text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-primary',
            )}
            aria-label={'Más opciones'}
          >
            <MoreHorizontal className={'h-5 w-5'} />
            <span className={'leading-none'}>Más</span>
          </button>
        </div>
      </nav>
    </div>
  );
}