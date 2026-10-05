import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, CalendarClock, ListTodo } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tasksForTeacher } from '../../lib/selectors';
import { StatCard, SkeletonCard, EmptyState } from '../../components/ui/Misc';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate, relativeDeadline, classNames } from '../../lib/utils';

export function TeacherDashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const user = state.currentUser!;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const tasks = useMemo(() => tasksForTeacher(state, user.id), [state, user.id]);
  const todaysActivities = useMemo(() => state.activities.filter((a) => a.teacherId === user.id && a.date === state.today), [state, user.id]);
  const upcoming = useMemo(
    () => tasks.filter((t) => !['Approved', 'Overdue'].includes(t.status)).sort((a, b) => (a.deadline > b.deadline ? 1 : -1)).slice(0, 5),
    [tasks],
  );

  const kpis = {
    today: todaysActivities.length,
    assigned: tasks.filter((t) => t.status === 'Assigned').length,
    pending: tasks.filter((t) => ['In Progress', 'Under Review', 'Rejected'].includes(t.status)).length,
    overdue: tasks.filter((t) => t.status === 'Overdue').length,
    completed: tasks.filter((t) => t.status === 'Approved').length,
    deadlines: upcoming.length,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<ListTodo />} label="Today's Work" value={kpis.today} />
        <StatCard icon={<ClipboardList />} label="Assigned Tasks" value={kpis.assigned} />
        <StatCard icon={<Clock />} label="Pending" value={kpis.pending} tone="warning" />
        <StatCard icon={<AlertTriangle />} label="Overdue" value={kpis.overdue} tone="danger" />
        <StatCard icon={<CheckCircle2 />} label="Completed" value={kpis.completed} tone="success" />
        <StatCard icon={<CalendarClock />} label="Upcoming Deadlines" value={kpis.deadlines} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="My Work Today" subtitle={formatDate(state.today)} />
          {todaysActivities.length === 0 ? (
            <EmptyState
              icon={<ListTodo />}
              title="Nothing logged today yet"
              description="Add today's activity to keep your work log current."
              action={
                <button onClick={() => navigate('/teacher/daily-activity')} className="text-sm font-medium text-navy-900 hover:underline">
                  + Add Activity
                </button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {todaysActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 text-[13.5px]">
                  <CheckCircle2 className="h-4 w-4 text-accent-600 shrink-0" />
                  <span className="text-ink">{a.title}</span>
                </div>
              ))}
              {kpis.pending > 0 && (
                <div className="flex items-center gap-2.5 text-[13.5px]">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-ink">{kpis.pending} task(s) still pending</span>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-3" padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Upcoming Deadlines"
              subtitle="Tasks that need your attention soon"
              action={
                <button onClick={() => navigate('/teacher/tasks')} className="text-xs font-medium text-navy-900 hover:underline">
                  View all tasks
                </button>
              }
            />
          </div>
          {upcoming.length === 0 ? (
            <div className="px-5 pb-5">
              <EmptyState title="You're all caught up" description="No pending deadlines right now." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcoming.map((t) => {
                const dl = relativeDeadline(t.deadline);
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/teacher/tasks/${t.id}`)}
                    className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-black/[0.015]"
                  >
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-ink truncate">{t.title}</p>
                      <p className={classNames('text-xs mt-0.5', dl.overdue ? 'text-red-600' : dl.urgent ? 'text-amber-600' : 'text-muted-2')}>
                        {dl.label}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
