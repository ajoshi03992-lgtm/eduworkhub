import { NavLink } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';
import type { NavItem } from './nav';
import { classNames } from '../../lib/utils';

export function Sidebar({
  items,
  mobileOpen,
  onCloseMobile,
}: {
  items: NavItem[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const content = (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 shrink-0">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-[15px] leading-tight tracking-tight">EduWorkHub</p>
          <p className="text-[11px] text-white/50 leading-tight mt-0.5">Faculty Work Management</p>
        </div>
        <button onClick={onCloseMobile} className="ml-auto text-white/60 hover:text-white lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[11px] text-white/40 leading-relaxed">
          ABC College of Science &amp; Technology
          <br />
          Department of Computer Science
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="absolute left-0 top-0 h-full w-64 animate-fade-in">{content}</div>
        </div>
      )}
    </>
  );
}
