import { useMemo } from 'react';
import { CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { notificationsFor } from '../../lib/selectors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { formatDateTime } from '../../lib/utils';

const ICON: Record<string, string> = {
  task_assigned: '🔔',
  deadline_reminder: '⏰',
  submission_approved: '✅',
  submission_rejected: '❌',
  new_comment: '💬',
  work_overdue: '⚠️',
  report_generated: '📄',
  new_submission: '📥',
};

export function HodNotifications() {
  const { state, markNotificationRead, markAllRead } = useApp();
  const user = state.currentUser!;
  const notifications = useMemo(() => notificationsFor(state, user.id), [state, user.id]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Notifications</h1>
          <p className="text-sm text-muted mt-0.5">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<CheckCheck />} onClick={() => markAllRead(user.id)}>
            Mark all read
          </Button>
        )}
      </div>

      <Card padded={false}>
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" description="You'll see task, submission and report updates here." />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`flex w-full items-start gap-3.5 px-5 py-4 text-left hover:bg-black/[0.015] transition-colors ${
                  !n.read ? 'bg-navy-100/20' : ''
                }`}
              >
                <span className="text-xl leading-none mt-0.5">{ICON[n.type] ?? '🔔'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-ink">{n.title}</span>
                  <span className="block text-[13px] text-muted mt-0.5">{n.message}</span>
                  <span className="block text-xs text-muted-2 mt-1.5">{formatDateTime(n.createdAt)}</span>
                </span>
                {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
