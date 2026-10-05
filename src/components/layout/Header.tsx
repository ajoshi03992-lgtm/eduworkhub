import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Settings as SettingsIcon, UserCircle2, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Misc';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { GlobalSearch } from './GlobalSearch';
import { unreadNotificationsFor, notificationsFor } from '../../lib/selectors';
import { formatDateLong, formatDateTime } from '../../lib/utils';

const NOTIF_ICON: Record<string, string> = {
  task_assigned: '🔔',
  deadline_reminder: '⏰',
  submission_approved: '✅',
  submission_rejected: '❌',
  new_comment: '💬',
  work_overdue: '⚠️',
  report_generated: '📄',
  new_submission: '📥',
};

export function Header({
  greetingName,
  subtitle,
  onOpenMobileNav,
  base,
}: {
  greetingName: string;
  subtitle: string;
  onOpenMobileNav: () => void;
  base: 'hod' | 'teacher';
}) {
  const { state, logout, markNotificationRead, markAllRead } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser;
  const unread = user ? unreadNotificationsFor(state, user.id) : [];
  const recent = user ? notificationsFor(state, user.id).slice(0, 6) : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/90 backdrop-blur px-4 sm:px-6 py-3.5">
      <button onClick={onOpenMobileNav} className="lg:hidden text-muted hover:text-ink shrink-0">
        <Menu className="h-5.5 w-5.5" />
      </button>

      <div className="min-w-0 mr-auto">
        <h1 className="font-display font-bold text-[17px] sm:text-[19px] text-ink leading-tight truncate">
          {greeting}, {greetingName}
        </h1>
        <p className="text-[12.5px] text-muted mt-0.5 truncate">
          {subtitle} · {formatDateLong(state.today)}
        </p>
      </div>

      <div className="hidden sm:block">
        <GlobalSearch base={base} />
      </div>

      <Dropdown
        align="right"
        width="w-80"
        trigger={() => (
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted hover:text-ink transition-colors">
            <Bell className="h-4.5 w-4.5" />
            {unread.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unread.length}
              </span>
            )}
          </button>
        )}
      >
        {(close) => (
          <div>
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              {user && unread.length > 0 && (
                <button
                  onClick={() => markAllRead(user.id)}
                  className="flex items-center gap-1 text-xs font-medium text-accent-700 hover:text-accent-800"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">You're all caught up.</p>}
              {recent.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    close();
                    navigate(base === 'hod' ? '/hod/notifications' : '/teacher/notifications');
                  }}
                  className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-black/[0.03] transition-colors ${
                    !n.read ? 'bg-navy-100/30' : ''
                  }`}
                >
                  <span className="text-base leading-none mt-0.5">{NOTIF_ICON[n.type] ?? '🔔'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{n.title}</span>
                    <span className="block text-xs text-muted mt-0.5 line-clamp-2">{n.message}</span>
                    <span className="block text-[11px] text-muted-2 mt-1">{formatDateTime(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
            <div className="border-t border-border px-3.5 py-2">
              <button
                onClick={() => {
                  close();
                  navigate(base === 'hod' ? '/hod/notifications' : '/teacher/notifications');
                }}
                className="text-xs font-medium text-navy-900 hover:underline"
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </Dropdown>

      <Dropdown
        align="right"
        width="w-56"
        trigger={(open) => (
          <button className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-black/[0.04] transition-colors">
            <Avatar name={user?.name ?? ''} color={user?.avatarColor} size="sm" />
            <span className="hidden md:block text-sm font-medium text-ink max-w-[120px] truncate">{user?.name}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      >
        {(close) => (
          <div>
            <div className="px-3.5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-ink truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <DropdownItem
                icon={<UserCircle2 />}
                onClick={() => {
                  close();
                  navigate(base === 'hod' ? '/hod/settings' : '/teacher/profile');
                }}
              >
                {base === 'hod' ? 'My Profile' : 'View Profile'}
              </DropdownItem>
              {base === 'hod' && (
                <DropdownItem
                  icon={<SettingsIcon />}
                  onClick={() => {
                    close();
                    navigate('/hod/settings');
                  }}
                >
                  Settings
                </DropdownItem>
              )}
              <DropdownItem
                icon={<LogOut />}
                danger
                onClick={() => {
                  close();
                  logout();
                  navigate('/login');
                }}
              >
                Sign out
              </DropdownItem>
            </div>
          </div>
        )}
      </Dropdown>
    </header>
  );
}
