import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FileBarChart, Download, Eye, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ReportType } from '../../types';
import { Card, CardHeader } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Select, Field } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ReportDocument } from '../../components/shared/ReportPreview';
import type { GeneratedReport } from '../../types';

const REPORT_TYPES: ReportType[] = [
  'Department Summary',
  'Teacher Work Report',
  'Task Completion Report',
  'Pending Work Report',
  'Overdue Work Report',
  'Academic Activity Report',
  'Document Submission Report',
  'Attendance Report',
  'Student Performance Report',
  'Monthly Department Report',
];

const COLORS = ['#16294F', '#2F6F5E', '#B45309', '#1D5B8F', '#B91C1C', '#7C4A9A', '#0E7490'];

export function ReportsAnalytics() {
  const { state, generateReport } = useApp();
  const [tab, setTab] = useState('Reports');
  const [reportType, setReportType] = useState<ReportType>('Monthly Department Report');
  const [teacherFilter, setTeacherFilter] = useState('All');
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null);

  const analytics = useMemo(() => {
    const completionTrend = ['Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({
      month: m,
      completed: 60 + i * 22 + Math.floor(Math.random() * 8),
    }));
    const workload = state.teachers
      .slice(0, 10)
      .map((t) => ({ name: t.name.replace('Prof. ', ''), tasks: state.tasks.filter((task) => task.assignedTeacherIds.includes(t.id)).length }));
    const monthlySubmissions = ['Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({ month: m, submissions: 40 + i * 15 }));
    const pendingVsCompleted = [
      { name: 'Completed', value: state.tasks.filter((t) => t.status === 'Approved').length },
      { name: 'Pending', value: state.tasks.filter((t) => ['Assigned', 'In Progress', 'Under Review', 'Rejected'].includes(t.status)).length },
      { name: 'Overdue', value: state.tasks.filter((t) => t.status === 'Overdue').length },
    ];
    const categoryWise = Object.entries(
      state.tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([category, count]) => ({ category, count }));
    const academicActivity = state.teachers.slice(0, 8).map((t) => ({
      name: t.name.replace('Prof. ', ''),
      activities: state.activities.filter((a) => a.teacherId === t.id).length,
    }));
    const attendanceTrend = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => ({ week: w, attendance: 82 + i * 2 }));
    const syllabusCompletion = state.syllabusProgress.slice(0, 8).map((s) => ({ subject: s.subject, overall: s.overall }));

    return { completionTrend, workload, monthlySubmissions, pendingVsCompleted, categoryWise, academicActivity, attendanceTrend, syllabusCompletion };
  }, [state]);

  function handleGenerate() {
    const report = generateReport(reportType, { teacherId: teacherFilter === 'All' ? undefined : teacherFilter }, 'September 2026');
    setPreviewReport(report);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Reports &amp; Analytics</h1>
        <p className="text-sm text-muted mt-0.5">Generate department reports and explore live analytics.</p>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-1">
          <Tabs tabs={['Reports', 'Analytics']} active={tab} onChange={setTab} />
        </div>

        {tab === 'Reports' ? (
          <div className="p-5 grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 space-y-4">
              <Field label="Report Type">
                <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
                  {REPORT_TYPES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Teacher">
                <Select value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}>
                  <option value="All">All Teachers</option>
                  {state.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Date Range">
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" defaultValue="2026-09-01" className="rounded-lg border border-border px-2.5 py-2 text-sm" />
                  <input type="date" defaultValue="2026-09-30" className="rounded-lg border border-border px-2.5 py-2 text-sm" />
                </div>
              </Field>
              <Button fullWidth icon={<FileBarChart />} onClick={handleGenerate}>
                Generate Report
              </Button>
            </div>

            <div className="lg:col-span-2">
              <p className="text-[13px] font-semibold text-ink mb-3">Recently Generated</p>
              {state.generatedReports.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
                  No reports generated yet this session. Configure filters and click Generate Report.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {state.generatedReports.slice(0, 8).map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink">{r.type}</p>
                        <p className="text-xs text-muted-2">{r.periodLabel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" icon={<Eye />} onClick={() => setPreviewReport(r)}>
                          Preview
                        </Button>
                        <Button size="sm" icon={<Download />} onClick={() => setPreviewReport(r)}>
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="grid lg:grid-cols-2 gap-5">
              <ChartCard title="Work Completion Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#2F6F5E" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Teacher Workload">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.workload}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={55} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#16294F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Submissions">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.monthlySubmissions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="submissions" fill="#1D5B8F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Pending vs Completed">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={analytics.pendingVsCompleted} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {analytics.pendingVsCompleted.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={24} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Category-wise Work">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.categoryWise} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2F6F5E" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Academic Activity">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.academicActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={55} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="activities" fill="#B45309" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Attendance Trend">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analytics.attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#1D5B8F" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Syllabus Completion">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.syllabusCompletion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="overall" fill="#7C4A9A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={!!previewReport}
        onClose={() => setPreviewReport(null)}
        title="Report Preview"
        subtitle={previewReport?.type}
        width="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setPreviewReport(null)}>
              Close
            </Button>
            <Button icon={<Printer />} onClick={() => window.print()}>
              Download / Print PDF
            </Button>
          </>
        }
      >
        {previewReport && (
          <div className="border border-border rounded-xl overflow-hidden bg-black/[0.015]">
            <ReportDocument report={previewReport} filterTeacherId={teacherFilter === 'All' ? undefined : teacherFilter} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      {children}
    </Card>
  );
}
