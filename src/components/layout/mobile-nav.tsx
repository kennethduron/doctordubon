'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { APP_NAME, CLINIC_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { getNavigationForRole } from './sidebar';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role } = useAuth();

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.replace('/login');
  }

  return (
    <div className={'lg:hidden'}>
      <div className={'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-soft bg-white px-4'}>
        <Link href={'/dashboard'} className={'flex min-w-0 items-center gap-3'}>
          <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white'}>CF</span>
          <span className={'min-w-0'}>
            <span className={'block truncate text-sm font-semibold text-primary'}>{APP_NAME}</span>
            <span className={'block truncate text-xs text-slate-500'}>{CLINIC_NAME}</span>
          </span>
        </Link>
        <button
          type={'button'}
          className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border-soft bg-white text-xl font-semibold text-primary'}
          aria-label={'Abrir menú'}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? '×' : '☰'}
        </button>
      </div>

      {open ? (
        <div className={'fixed inset-x-0 top-16 z-30 border-b border-border-soft bg-white p-4 shadow-lg'}>
          <nav className={'grid gap-2'}>
            {getNavigationForRole(role).map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-medium',
                    active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-700',
                  )}
                >
                  <span>{item.label}</span>
                  <span>{item.icon}</span>
                </Link>
              );
            })}
            <button
              type={'button'}
              onClick={handleLogout}
              className={'mt-2 flex min-h-11 items-center justify-center rounded-md border border-border-soft text-sm font-semibold text-primary'}
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
