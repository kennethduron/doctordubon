'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { APP_NAME, CLINIC_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
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
      <div className={'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-soft bg-white/95 px-4 shadow-sm backdrop-blur'}>
        <Link href={'/dashboard'} className={'flex min-w-0 items-center gap-3'}>
          <span className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white'}>CF</span>
          <span className={'min-w-0'}>
            <span className={'block truncate text-sm font-bold text-primary'}>{APP_NAME}</span>
            <span className={'block truncate text-xs text-slate-500'}>{CLINIC_NAME}</span>
          </span>
        </Link>
        <button
          type={'button'}
          className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-soft bg-white text-primary shadow-sm'}
          aria-label={'Abrir menú'}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className={'h-5 w-5'} /> : <Menu className={'h-5 w-5'} />}
        </button>
      </div>

      {open ? (
        <div className={'fixed inset-x-0 top-16 z-30 border-b border-border-soft bg-white p-4 shadow-lg'}>
          <nav className={'grid gap-2'}>
            {getNavigationForRole(role).map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-semibold',
                    active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-700',
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
              className={'mt-2 flex min-h-12 items-center justify-center rounded-lg border border-border-soft text-sm font-semibold text-primary'}
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
