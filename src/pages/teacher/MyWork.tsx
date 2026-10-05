import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tasksForTeacher } from '../../lib/selectors';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { formatDate, relativeDeadline, classNames } from '../../lib/utils';

export function MyWork() {
  const { state } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const tasks = useMemo(() => tasksForTeacher(state, user.id), [state, user.id]);

  const dueToday = tasks.filter((t) => t.deadline === state.today && !['Approved'].includes(t.status));
  const dueThisWeek = tasks.filter((t) => {
    const days = Math.round((new Date(t.deadline).getTime() - new Date(state.today).getTime()) / 86400000);
    return days > 0 && days <= 7 && t.status !== 'Approved';
  });
  const overdue = tasks.filter((t) => t.status === 'Overdue');
  const inProgress = tasks.filter((t) => t.status === 'In Progress');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">My Work</h1>
        <p className="text-sm text-muted mt-0.5">Everything due today, this week, and currently in progress.</p>
      </div>

      <Section title="Overdue" icon={<AlertTriangle className="h-4 w-4" />} tone="danger" tasks={overdue} navigate={navigate} />
      <Section title="Due Today" icon={<Circle className="h-4 w-4" />} tone="warning" tasks={dueToday} navigate={navigate} />
      <Section title="In Progress" icon={<Circle className="h-4 w-4" />} tone="info" tasks={inProgress} navigate={navigate} />
      <Section title="Due This Week" icon={<CheckCircle2 className="h-4 w-4" />} tone="neutral" tasks={dueThisWeek} navigate={navigate} />
    </div>
  );
}

function Section({
  title,
  icon,
  tasks,
  navigate,
}: {
  title: string;
  icon: React.ReactNode;
  tone: 'danger' | 'warning' | 'info' | 'neutral';
  tasks: ReturnType<typeof tasksForTeacher>;
  navigate: (path: string) => void;
}) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-2">
        <CardHeader title={title} icon={icon} subtitle={`${tasks.length} task${tasks.length === 1 ? '' : 's'}`} />
      </div>
      {tasks.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-muted">Nothing here right now.</p>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map((t) => {
            const dl = relativeDeadline(t.deadline);
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/teacher/tasks/${t.id}`)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-black/[0.015]"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-ink truncate">{t.title}</p>
                  <p className={classNames('text-xs mt-0.5', dl.overdue ? 'text-red-600' : 'text-muted-2')}>
                    {dl.label} · Due {formatDate(t.deadline)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
