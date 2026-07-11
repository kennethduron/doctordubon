'use client';

import { useState, type ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RoleGuard } from '@/components/auth/role-guard';
import { cn } from '@/lib/utils';
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

const SIDEBAR_COLLAPSED_KEY = 'doctordubon.sidebarCollapsed';

export function AppShell({ title, subtitle, allowedRoles, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  function handleSidebarToggle() {
    setSidebarCollapsed((current) => {
      const nextValue = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextValue));
      return nextValue;
    });
  }

  const content = (
    <div className={'min-h-screen overflow-x-hidden bg-background'}>
      <MobileNav />
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <main
        className={cn(
          'min-w-0 transition-[padding] duration-300 lg:min-h-screen',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72',
        )}
      >
        <Topbar title={title} subtitle={subtitle} />
        <div className={'mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 lg:px-7 lg:pb-8 lg:pt-6'}>{children}</div>
      </main>
    </div>
  );

  return (
    <ProtectedRoute>
      {allowedRoles ? <RoleGuard allowedRoles={allowedRoles}>{content}</RoleGuard> : content}
    </ProtectedRoute>
  );
}