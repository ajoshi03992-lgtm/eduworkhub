import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { HOD_NAV, TEACHER_NAV } from './nav';
import { useApp } from '../../context/AppContext';
import { Toaster } from '../ui/Toaster';

export function AppShell({ base }: { base: 'hod' | 'teacher' }) {
  const { state } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = base === 'hod' ? HOD_NAV : TEACHER_NAV;
  const user = state.currentUser;

  const greetingName = user?.name ?? '';
  const subtitle = 'Department of Computer Science';

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar items={items} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          greetingName={greetingName}
          subtitle={subtitle}
          onOpenMobileNav={() => setMobileOpen(true)}
          base={base}
        />
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
