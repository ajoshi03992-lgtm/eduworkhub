import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Select } from '../../components/ui/Form';
import { EmptyState } from '../../components/ui/Misc';
import { formatDate } from '../../lib/utils';

const TABS = ['Syllabus Progress', 'Lecture Records', 'Attendance', 'Student Performance'];

export function HodAcademicWork() {
  const { state } = useApp();
  const [tab, setTab] = useState('Syllabus Progress');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const subjects = useMemo(() => Array.from(new Set(state.syllabusProgress.map((s) => s.subject))), [state.syllabusProgress]);

  const syllabusRows = useMemo(
    () => state.syllabusProgress.filter((s) => subjectFilter === 'All' || s.subject === subjectFilter),
    [state.syllabusProgress, subjectFilter],
  );

  const attendanceSummary = useMemo(() => {
    const bySubject: Record<string, { total: number; present: number }> = {};
    state.attendance.forEach((a) => {
      bySubject[a.subject] ??= { total: 0, present: 0 };
      bySubject[a.subject].total += a.totalStudents;
      bySubject[a.subject].present += a.present;
    });
    return Object.entries(bySubject).map(([subject, v]) => ({ subject, percent: Math.round((v.present / v.total) * 100) }));
  }, [state.attendance]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Academic Work</h1>
        <p className="text-sm text-muted mt-0.5">Syllabus coverage, lecture records and academic progress across the department.</p>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        <div className="p-5">
          {tab === 'Syllabus Progress' && (
            <div>
              <div className="flex justify-end mb-4">
                <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-48">
                  <option value="All">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {syllabusRows.slice(0, 12).map((s, i) => {
                  const teacher = state.teachers.find((t) => t.id === s.teacherId);
                  return (
                    <div key={i} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <div>
                          <p className="text-[13.5px] font-semibold text-ink">{s.subject}</p>
                          <p className="text-xs text-muted-2">{teacher?.name}</p>
                        </div>
                        <span className="font-display text-lg font-bold text-accent-700">{s.overall}%</span>
                      </div>
                      {s.units.map((u) => (
                        <div key={u.name} className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] text-muted-2 w-14 shrink-0">{u.name}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-black/[0.06] overflow-hidden">
                            <div className="h-full bg-accent-600 rounded-full" style={{ width: `${u.percent}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-2 w-8 text-right">{u.percent}%</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'Lecture Records' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                    <th className="py-2 font-medium">Teacher</th>
                    <th className="py-2 font-medium">Subject</th>
                    <th className="py-2 font-medium">Class</th>
                    <th className="py-2 font-medium">Topic</th>
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {state.academicRecords.slice(0, 25).map((r) => {
                    const teacher = state.teachers.find((t) => t.id === r.teacherId);
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-3 font-medium text-ink whitespace-nowrap">{teacher?.name}</td>
                        <td className="py-2.5 pr-3 text-muted">{r.subject}</td>
                        <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{r.classDivision}</td>
                        <td className="py-2.5 pr-3 text-muted">{r.topicCovered}</td>
                        <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{formatDate(r.lectureDate)}</td>
                        <td className="py-2.5 text-muted">{r.hours}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'Attendance' && (
            <div className="grid sm:grid-cols-3 gap-4">
              {attendanceSummary.length === 0 ? (
                <EmptyState title="No attendance recorded yet" />
              ) : (
                attendanceSummary.map((a) => (
                  <div key={a.subject} className="rounded-xl border border-border p-4 text-center">
                    <p className="text-[13px] font-medium text-muted">{a.subject}</p>
                    <p className="font-display text-2xl font-bold text-ink mt-1">{a.percent}%</p>
                    <p className="text-xs text-muted-2 mt-1">Average attendance</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'Student Performance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                    <th className="py-2 font-medium">Teacher</th>
                    <th className="py-2 font-medium">Subject</th>
                    <th className="py-2 font-medium">Assessment</th>
                    <th className="py-2 font-medium text-center">Passed / Total</th>
                    <th className="py-2 font-medium text-center">Average</th>
                    <th className="py-2 font-medium text-center">High / Low</th>
                  </tr>
                </thead>
                <tbody>
                  {state.studentPerformance.slice(0, 20).map((p) => {
                    const teacher = state.teachers.find((t) => t.id === p.teacherId);
                    return (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-3 font-medium text-ink whitespace-nowrap">{teacher?.name}</td>
                        <td className="py-2.5 pr-3 text-muted">{p.subject}</td>
                        <td className="py-2.5 pr-3 text-muted whitespace-nowrap">{p.assessment}</td>
                        <td className="py-2.5 pr-3 text-center text-muted">
                          {p.passed}/{p.totalStudents}
                        </td>
                        <td className="py-2.5 pr-3 text-center font-medium">{p.averageMarks}</td>
                        <td className="py-2.5 text-center text-muted">
                          {p.highest} / {p.lowest}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
