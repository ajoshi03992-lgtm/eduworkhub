import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, BadgeCheck, CalendarDays, BookMarked } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { teacherLiveStats } from '../../lib/selectors';
import { Card } from '../../components/ui/Card';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { formatDate, formatDateLong, formatTime } from '../../lib/utils';

const TABS = ['Overview', 'Academic Work', 'Assigned Tasks', 'Documents', 'Activities', 'Submissions', 'Reports'];

export function TeacherProfile() {
  const { id } = useParams();
  const { state } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [timeFilter, setTimeFilter] = useState<'Today' | 'This Week' | 'This Month'>('This Week');

  const teacher = state.teachers.find((t) => t.id === id);

  const tasks = useMemo(() => state.tasks.filter((t) => teacher && t.assignedTeacherIds.includes(teacher.id)), [state.tasks, teacher]);
  const documents = useMemo(() => state.documents.filter((d) => teacher && d.teacherId === teacher.id), [state.documents, teacher]);
  const activities = useMemo(
    () => (teacher ? state.activities.filter((a) => a.teacherId === teacher.id) : []),
    [state.activities, teacher],
  );
  const submissions = useMemo(
    () => (teacher ? state.submissions.filter((s) => s.teacherId === teacher.id) : []),
    [state.submissions, teacher],
  );
  const syllabus = useMemo(
    () => (teacher ? state.syllabusProgress.filter((s) => s.teacherId === teacher.id) : []),
    [state.syllabusProgress, teacher],
  );

  const filteredActivities = useMemo(() => {
    const now = new Date(state.today);
    return activities
      .filter((a) => {
        const d = new Date(a.date);
        const diffDays = Math.round((now.getTime() - d.getTime()) / 86400000);
        if (timeFilter === 'Today') return diffDays === 0;
        if (timeFilter === 'This Week') return diffDays <= 7;
        return diffDays <= 30;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [activities, timeFilter, state.today]);

  if (!teacher) {
    return (
      <EmptyState
        title="Teacher not found"
        description="This profile may have been removed."
        action={
          <button onClick={() => navigate('/hod/teachers')} className="text-sm font-medium text-navy-900 hover:underline">
            Back to Teachers
          </button>
        }
      />
    );
  }

  const stats = teacherLiveStats(state, teacher);

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/hod/teachers')} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Teachers
      </button>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar name={teacher.name} color={teacher.avatarColor} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl font-bold text-ink">{teacher.name}</h1>
              <StatusBadge status={teacher.status} />
              <StatusBadge status={teacher.currentStatus} />
            </div>
            <p className="text-sm text-muted mt-1">
              {teacher.designation} · {teacher.department}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-[13px] text-muted">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" /> {teacher.employeeId}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {teacher.email}
              </span>
              {teacher.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {teacher.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(teacher.joinDate)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {teacher.subjects.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md bg-navy-100 text-navy-900 text-xs font-medium px-2 py-1">
                  <BookMarked className="h-3 w-3" /> {s}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-5 shrink-0">
            {[
              ['Assigned', stats.assigned],
              ['Completed', stats.completed],
              ['Pending', stats.pending],
              ['Overdue', stats.overdue],
              ['Documents', stats.documents],
              ['Activities', stats.activities],
            ].map(([label, value]) => (
              <div key={label as string} className="text-center">
                <p className="font-display text-lg font-bold text-ink">{value}</p>
                <p className="text-[11px] text-muted-2 whitespace-nowrap">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-1">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="p-5">
          {tab === 'Overview' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[13px] font-semibold text-ink mb-2.5">Syllabus Progress</p>
                <div className="space-y-3">
                  {syllabus.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-ink font-medium">{s.subject}</span>
                        <span className="text-muted">{s.overall}%</span>
                      </div>
                      {s.units.map((u) => (
                        <div key={u.name} className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-muted-2 w-14 shrink-0">{u.name}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-black/[0.06] overflow-hidden">
                            <div className="h-full bg-accent-600 rounded-full" style={{ width: `${u.percent}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-2 w-8 text-right">{u.percent}%</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink mb-2.5">Recent Submissions</p>
                <div className="space-y-2">
                  {submissions.slice(0, 4).map((s) => {
                    const task = state.tasks.find((t) => t.id === s.taskId);
                    return (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                        <span className="text-[13px] text-ink truncate">{task?.title}</span>
                        <StatusBadge status={s.status} />
                      </div>
                    );
                  })}
                  {submissions.length === 0 && <p className="text-sm text-muted">No submissions yet.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === 'Academic Work' && (
            <div className="space-y-3">
              {state.academicRecords
                .filter((r) => r.teacherId === teacher.id)
                .slice(0, 10)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink">{r.topicCovered}</p>
                      <p className="text-xs text-muted-2 mt-0.5">
                        {r.subject} · {r.classDivision} · {r.lectureType} · {formatDate(r.lectureDate)}
                      </p>
                    </div>
                    <span className="text-xs text-muted shrink-0">{r.hours}h</span>
                  </div>
                ))}
            </div>
          )}

          {tab === 'Assigned Tasks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                    <th className="py-2 font-medium">Task</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Deadline</th>
                    <th className="py-2 font-medium">Priority</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 15).map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-ink">{t.title}</td>
                      <td className="py-2.5 pr-3 text-muted">{t.category}</td>
                      <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{formatDate(t.deadline)}</td>
                      <td className="py-2.5 pr-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Documents' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {documents.slice(0, 12).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{d.name}</p>
                    <p className="text-xs text-muted-2 mt-0.5">
                      {d.category} · {d.fileType} · {(d.sizeKb / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Activities' && (
            <div>
              <div className="flex items-center gap-1 mb-4">
                {(['Today', 'This Week', 'This Month'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                      timeFilter === f ? 'bg-navy-900 text-white' : 'bg-black/[0.04] text-muted hover:text-ink'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {filteredActivities.length === 0 ? (
                <EmptyState title="No activity in this range" />
              ) : (
                <div className="relative pl-5 border-l-2 border-border space-y-5">
                  {Object.entries(
                    filteredActivities.reduce<Record<string, typeof filteredActivities>>((acc, a) => {
                      (acc[a.date] ??= []).push(a);
                      return acc;
                    }, {}),
                  ).map(([date, items]) => (
                    <div key={date}>
                      <p className="text-[13px] font-semibold text-ink -ml-5 pl-5 relative before:content-[''] before:absolute before:-left-[9px] before:top-1.5 before:h-3 before:w-3 before:rounded-full before:bg-navy-900">
                        {formatDateLong(date)}
                      </p>
                      <div className="mt-2 space-y-2">
                        {items.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-[13px]">
                            <span className="text-ink">{a.title}</span>
                            <span className="text-muted-2 shrink-0 ml-3">{a.startTime ?? ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Submissions' && (
            <div className="space-y-3">
              {submissions.length === 0 && <EmptyState title="No submissions" />}
              {submissions.map((s) => {
                const task = state.tasks.find((t) => t.id === s.taskId);
                return (
                  <div key={s.id} className="rounded-lg border border-border px-3.5 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-ink">{task?.title}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-2 space-y-1">
                      {s.versions.map((v) => (
                        <p key={v.version} className="text-xs text-muted">
                          Version {v.version} · Submitted {formatDate(v.submittedAt.slice(0, 10))} · {v.outcome}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'Reports' && (
            <EmptyState
              title="Generate a report for this teacher"
              description="Use Reports & Analytics and filter by this teacher to generate a personalised work report."
              action={
                <button onClick={() => navigate('/hod/reports')} className="text-sm font-medium text-navy-900 hover:underline">
                  Go to Reports & Analytics
                </button>
              }
            />
          )}
        </div>
      </Card>
      <span className="hidden">{formatTime('')}</span>
    </div>
  );
}
