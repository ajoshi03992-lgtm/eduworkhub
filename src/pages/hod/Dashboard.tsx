import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileCheck2,
  CalendarClock,
  RefreshCcw,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { departmentKpis, attentionItems, teacherLiveStats } from '../../lib/selectors';
import { StatCard, SkeletonCard, SkeletonRows, Avatar, EmptyState } from '../../components/ui/Misc';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { formatTime, classNames } from '../../lib/utils';

export function HodDashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'completion' | 'assigned' | 'overdue'>('completion');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const kpis = useMemo(() => departmentKpis(state), [state]);
  const attention = useMemo(() => attentionItems(state), [state]);

  const recentActivity = useMemo(
    () =>
      [...state.activities]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 8)
        .map((a) => ({ ...a, teacher: state.teachers.find((t) => t.id === a.teacherId) })),
    [state.activities, state.teachers],
  );

  const teacherRows = useMemo(() => {
    const rows = state.teachers.map((t) => ({ teacher: t, stats: teacherLiveStats(state, t) }));
    const filtered = rows.filter(
      (r) =>
        r.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        r.teacher.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase())),
    );
    return filtered.sort((a, b) => {
      if (sortKey === 'completion') return b.stats.completionRate - a.stats.completionRate;
      if (sortKey === 'assigned') return b.stats.assigned - a.stats.assigned;
      return b.stats.overdue - a.stats.overdue;
    });
  }, [state, search, sortKey]);

  const attentionCards = [
    {
      key: 'review',
      label: `${attention.underReview.length} submission${attention.underReview.length === 1 ? '' : 's'} waiting for review`,
      icon: <FileCheck2 className="h-4 w-4" />,
      tone: 'warning' as const,
      onClick: () => navigate('/hod/submissions'),
    },
    {
      key: 'overdue',
      label: `${attention.overdueTasks.length} overdue teacher task${attention.overdueTasks.length === 1 ? '' : 's'}`,
      icon: <AlertTriangle className="h-4 w-4" />,
      tone: 'danger' as const,
      onClick: () => navigate('/hod/work'),
    },
    {
      key: 'rejected',
      label: `${attention.rejectedAwaiting.length} rejected submission${attention.rejectedAwaiting.length === 1 ? '' : 's'} awaiting resubmission`,
      icon: <RefreshCcw className="h-4 w-4" />,
      tone: 'danger' as const,
      onClick: () => navigate('/hod/submissions'),
    },
    {
      key: 'deadline',
      label: `${attention.approaching.length} deadline${attention.approaching.length === 1 ? '' : 's'} approaching`,
      icon: <CalendarClock className="h-4 w-4" />,
      tone: 'warning' as const,
      onClick: () => navigate('/hod/work'),
    },
    {
      key: 'missing',
      label: `${attention.missingActivity.length} teacher has missing daily activity`,
      icon: <Clock className="h-4 w-4" />,
      tone: 'neutral' as const,
      onClick: () => navigate('/hod/activity-log'),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <Card>
          <SkeletonRows rows={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="Total Teachers" value={kpis.totalTeachers} trend={{ direction: 'flat', label: 'Dept. strength' }} />
        <StatCard icon={<UserCheck />} label="Active Today" value={kpis.activeToday} tone="success" trend={{ direction: 'up', label: `${Math.round((kpis.activeToday / kpis.totalTeachers) * 100)}% present` }} />
        <StatCard icon={<ClipboardList />} label="Total Assigned Work" value={kpis.assigned} trend={{ direction: 'flat', label: 'This semester' }} />
        <StatCard icon={<CheckCircle2 />} label="Completed" value={kpis.completed} tone="success" trend={{ direction: 'up', label: `${kpis.completionRate}% of total` }} />
        <StatCard icon={<Clock />} label="Pending" value={kpis.pending} tone="warning" trend={{ direction: 'flat', label: 'In the pipeline' }} />
        <StatCard icon={<AlertTriangle />} label="Overdue" value={kpis.overdue} tone="danger" trend={{ direction: kpis.overdue > 8 ? 'up' : 'down', label: 'Needs attention' }} />
        <StatCard icon={<TrendingUp />} label="Completion Rate" value={`${kpis.completionRate}%`} tone="success" trend={{ direction: 'up', label: 'vs last month' }} />
        <StatCard icon={<FileCheck2 />} label="Under Review" value={attention.underReview.length} trend={{ direction: 'flat', label: 'Awaiting decision' }} />
      </div>

      {/* Requires Attention */}
      <Card>
        <CardHeader title="Requires Attention" subtitle="Items that need your decision today" icon={<AlertTriangle />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {attentionCards.map((c) => (
            <button
              key={c.key}
              onClick={c.onClick}
              className={classNames(
                'text-left rounded-xl border p-3.5 transition-all hover:shadow-md',
                c.tone === 'danger' && 'border-red-100 bg-red-50/60 hover:border-red-200',
                c.tone === 'warning' && 'border-amber-100 bg-amber-50/60 hover:border-amber-200',
                c.tone === 'neutral' && 'border-border bg-black/[0.02] hover:border-navy-700/30',
              )}
            >
              <span
                className={classNames(
                  'flex h-8 w-8 items-center justify-center rounded-lg mb-2.5',
                  c.tone === 'danger' && 'bg-red-100 text-red-700',
                  c.tone === 'warning' && 'bg-amber-100 text-amber-700',
                  c.tone === 'neutral' && 'bg-black/[0.06] text-muted',
                )}
              >
                {c.icon}
              </span>
              <p className="text-[13px] font-medium text-ink leading-snug">{c.label}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Department Activity */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Department Activity"
            subtitle="Live feed of faculty work"
            action={
              <button onClick={() => navigate('/hod/activity-log')} className="text-xs font-medium text-navy-900 hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            }
          />
          {recentActivity.length === 0 ? (
            <EmptyState title="No recent activity" description="Faculty activity will appear here as it happens." />
          ) : (
            <div className="space-y-1">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                  <Avatar name={a.teacher?.name ?? '?'} color={a.teacher?.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-ink">
                      <span className="font-medium">{a.teacher?.name}</span> · {a.title}
                    </p>
                    <p className="text-[11.5px] text-muted-2 mt-0.5">{formatTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Teacher Work Overview */}
        <Card className="xl:col-span-3" padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Teacher Work Overview"
              subtitle="Assigned, completed and overdue work by teacher"
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search teacher…"
                      className="pl-8 py-1.5 text-[13px] w-40"
                    />
                  </div>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                    className="text-[13px] rounded-lg border border-border px-2 py-1.5 bg-white outline-none"
                  >
                    <option value="completion">Sort: Completion</option>
                    <option value="assigned">Sort: Assigned</option>
                    <option value="overdue">Sort: Overdue</option>
                  </select>
                </div>
              }
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Teacher</th>
                  <th className="px-3 py-2.5 font-medium">Subject</th>
                  <th className="px-3 py-2.5 font-medium text-center">Assigned</th>
                  <th className="px-3 py-2.5 font-medium text-center">Completed</th>
                  <th className="px-3 py-2.5 font-medium text-center">Pending</th>
                  <th className="px-3 py-2.5 font-medium text-center">Overdue</th>
                  <th className="px-3 py-2.5 font-medium text-center">Completion</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {teacherRows.slice(0, 8).map(({ teacher, stats }) => (
                  <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-black/[0.015]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={teacher.name} color={teacher.avatarColor} size="sm" />
                        <span className="font-medium text-ink whitespace-nowrap">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{teacher.subjects[0]}</td>
                    <td className="px-3 py-3 text-center">{stats.assigned}</td>
                    <td className="px-3 py-3 text-center">{stats.completed}</td>
                    <td className="px-3 py-3 text-center">{stats.pending}</td>
                    <td className="px-3 py-3 text-center">{stats.overdue}</td>
                    <td className="px-3 py-3 text-center font-medium">{stats.completionRate}%</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={teacher.currentStatus} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/hod/teachers/${teacher.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <button onClick={() => navigate('/hod/teachers')} className="text-xs font-medium text-navy-900 hover:underline">
              View all {state.teachers.length} teachers →
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
