'use client';

import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RoleGuard } from '@/components/auth/role-guard';
import type { Role } from '@/types/role';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

type AppShellProps = {
  title: string;
  subtitle: string;
  allowedRoles?: Role[];
  children: ReactNode;
};

export function AppShell({ title, subtitle, allowedRoles, children }: AppShellProps) {
  const content = (
    <div className={'min-h-screen bg-background'}>
      <MobileNav />
      <div className={'flex min-h-screen'}>
        <Sidebar />
        <main className={'min-w-0 flex-1'}>
          <Topbar title={title} subtitle={subtitle} />
          <div className={'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8'}>{children}</div>
        </main>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      {allowedRoles ? <RoleGuard allowedRoles={allowedRoles}>{content}</RoleGuard> : content}
    </ProtectedRoute>
  );
}
