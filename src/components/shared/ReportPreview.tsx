import { useApp } from '../../context/AppContext';
import { departmentKpis, teacherLiveStats } from '../../lib/selectors';
import type { GeneratedReport } from '../../types';
import { formatDateLong, formatDate } from '../../lib/utils';

export function ReportDocument({ report, filterTeacherId }: { report: GeneratedReport; filterTeacherId?: string }) {
  const { state } = useApp();
  const kpis = departmentKpis(state);
  const teachers = filterTeacherId ? state.teachers.filter((t) => t.id === filterTeacherId) : state.teachers;
  const pendingTasks = state.tasks.filter((t) => ['Assigned', 'In Progress', 'Under Review'].includes(t.status));
  const overdueTasks = state.tasks.filter((t) => t.status === 'Overdue');

  return (
    <div id="report-print-area" className="bg-white text-ink max-w-3xl mx-auto p-8 sm:p-10 font-sans">
      <div className="text-center border-b-2 border-navy-900 pb-5 mb-6">
        <p className="font-display font-bold text-lg">ABC College of Science &amp; Technology</p>
        <p className="text-sm text-muted">Department of Computer Science</p>
        <h1 className="font-display font-bold text-xl mt-3 uppercase tracking-wide">{report.type}</h1>
        <p className="text-sm text-muted mt-1">Report Period: {report.periodLabel}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7 text-center">
        {[
          ['Total Teachers', teachers.length],
          ['Work Assigned', kpis.assigned],
          ['Completed', kpis.completed],
          ['Completion Rate', `${kpis.completionRate}%`],
        ].map(([label, value]) => (
          <div key={label as string} className="border border-border rounded-lg py-3">
            <p className="font-display text-xl font-bold">{value}</p>
            <p className="text-[11px] text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Section title="Teacher-wise Summary">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="border-b border-ink/20 text-left">
              <th className="py-1.5 pr-2 font-semibold">Teacher</th>
              <th className="py-1.5 pr-2 font-semibold">Subject</th>
              <th className="py-1.5 pr-2 font-semibold text-center">Assigned</th>
              <th className="py-1.5 pr-2 font-semibold text-center">Completed</th>
              <th className="py-1.5 pr-2 font-semibold text-center">Pending</th>
              <th className="py-1.5 font-semibold text-center">Completion</th>
            </tr>
          </thead>
          <tbody>
            {teachers.slice(0, 15).map((t) => {
              const s = teacherLiveStats(state, t);
              return (
                <tr key={t.id} className="border-b border-border">
                  <td className="py-1.5 pr-2">{t.name}</td>
                  <td className="py-1.5 pr-2">{t.subjects.join(', ')}</td>
                  <td className="py-1.5 pr-2 text-center">{s.assigned}</td>
                  <td className="py-1.5 pr-2 text-center">{s.completed}</td>
                  <td className="py-1.5 pr-2 text-center">{s.pending}</td>
                  <td className="py-1.5 text-center">{s.completionRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section title="Task-wise Summary">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="border-b border-ink/20 text-left">
              <th className="py-1.5 pr-2 font-semibold">Task</th>
              <th className="py-1.5 pr-2 font-semibold">Category</th>
              <th className="py-1.5 pr-2 font-semibold">Deadline</th>
              <th className="py-1.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.tasks.slice(0, 12).map((t) => (
              <tr key={t.id} className="border-b border-border">
                <td className="py-1.5 pr-2">{t.title}</td>
                <td className="py-1.5 pr-2">{t.category}</td>
                <td className="py-1.5 pr-2">{formatDate(t.deadline)}</td>
                <td className="py-1.5">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <div className="grid sm:grid-cols-2 gap-6">
        <Section title="Pending Work">
          <p className="text-[12.5px]">{pendingTasks.length} tasks currently pending across the department.</p>
          <ul className="text-[12px] mt-1.5 list-disc pl-4 space-y-0.5">
            {pendingTasks.slice(0, 6).map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </Section>
        <Section title="Overdue Work">
          <p className="text-[12.5px]">{overdueTasks.length} tasks are overdue and require follow-up.</p>
          <ul className="text-[12px] mt-1.5 list-disc pl-4 space-y-0.5">
            {overdueTasks.slice(0, 6).map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Academic Activity Summary">
        <p className="text-[12.5px]">
          {state.academicRecords.length} lecture records logged · {state.activities.length} total activities recorded department-wide.
        </p>
      </Section>

      <Section title="Document Submission Summary">
        <p className="text-[12.5px]">
          {state.documents.length} documents on file · {state.submissions.filter((s) => s.status === 'Approved').length} submissions approved ·{' '}
          {state.submissions.filter((s) => s.status === 'Under Review').length} awaiting review.
        </p>
      </Section>

      <div className="flex items-end justify-between mt-10 pt-5 border-t border-border">
        <div>
          <p className="text-[11px] text-muted-2">Generated on {formatDateLong(report.generatedAt.slice(0, 10))}</p>
          <p className="text-[11px] text-muted-2">EduWorkHub — College Faculty Work Management &amp; Reporting System</p>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-ink mb-1" />
          <p className="text-[11px] text-muted-2">HOD Signature</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-display font-semibold text-[13.5px] uppercase tracking-wide text-navy-900 border-b border-border pb-1.5 mb-2.5">
        {title}
      </h2>
      {children}
    </div>
  );
}
