import { useMemo, useState } from 'react';
import { FileCheck2, FileText, MessageSquare, History, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea, Field } from '../../components/ui/Form';
import { formatDateTime } from '../../lib/utils';

const TABS = ['Under Review', 'Approved', 'Rejected', 'All'];

export function Submissions() {
  const { state, reviewSubmission } = useApp();
  const [tab, setTab] = useState('Under Review');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState('');

  const rows = useMemo(() => {
    let list = state.submissions;
    if (tab !== 'All') list = list.filter((s) => s.status === tab);
    return list
      .map((s) => ({
        submission: s,
        task: state.tasks.find((t) => t.id === s.taskId),
        teacher: state.teachers.find((t) => t.id === s.teacherId),
      }))
      .filter((r) => r.task && r.teacher)
      .sort((a, b) => (a.submission.versions.at(-1)!.submittedAt < b.submission.versions.at(-1)!.submittedAt ? 1 : -1));
  }, [state, tab]);

  const counts = {
    'Under Review': state.submissions.filter((s) => s.status === 'Under Review').length,
    Approved: state.submissions.filter((s) => s.status === 'Approved').length,
    Rejected: state.submissions.filter((s) => s.status === 'Rejected').length,
    All: state.submissions.length,
  };

  const active = activeId ? rows.find((r) => r.submission.id === activeId) : null;

  function approve() {
    if (!active) return;
    reviewSubmission(active.submission.id, 'Approved');
    setActiveId(null);
  }
  function reject() {
    if (!active || !comment.trim()) return;
    reviewSubmission(active.submission.id, 'Rejected', comment.trim());
    setRejectOpen(false);
    setActiveId(null);
    setComment('');
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Submission Review</h1>
        <p className="text-sm text-muted mt-0.5">Review teacher submissions, approve or request changes.</p>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-1">
          <Tabs tabs={TABS} active={tab} onChange={setTab} counts={counts} />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<FileCheck2 />} title="No submissions" description="Submissions in this category will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Teacher</th>
                  <th className="px-3 py-2.5 font-medium">Task</th>
                  <th className="px-3 py-2.5 font-medium">Submitted</th>
                  <th className="px-3 py-2.5 font-medium">File</th>
                  <th className="px-3 py-2.5 font-medium">Version</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ submission, task, teacher }) => {
                  const latest = submission.versions.at(-1)!;
                  return (
                    <tr key={submission.id} className="border-b border-border last:border-0 hover:bg-black/[0.015]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={teacher!.name} color={teacher!.avatarColor} size="sm" />
                          <span className="font-medium text-ink whitespace-nowrap">{teacher!.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink whitespace-nowrap">{task!.title}</td>
                      <td className="px-3 py-3 text-muted whitespace-nowrap">{formatDateTime(latest.submittedAt)}</td>
                      <td className="px-3 py-3 text-muted whitespace-nowrap flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> {latest.fileName}
                      </td>
                      <td className="px-3 py-3 text-muted">v{submission.currentVersion}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => setActiveId(submission.id)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!active && !rejectOpen}
        onClose={() => setActiveId(null)}
        title="Review Submission"
        subtitle={active ? `${active.task?.title} — ${active.teacher?.name}` : ''}
        width="lg"
        footer={
          active?.submission.status === 'Under Review' ? (
            <>
              <Button variant="danger" icon={<XCircle />} onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
              <Button variant="secondary" icon={<CheckCircle2 />} onClick={approve}>
                Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setActiveId(null)}>
              Close
            </Button>
          )
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-2">Teacher</p>
                <p className="font-medium text-ink">{active.teacher?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-2">Task</p>
                <p className="font-medium text-ink">{active.task?.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-2">Category</p>
                <p className="font-medium text-ink">{active.task?.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-2">Deadline</p>
                <p className="font-medium text-ink">{active.task && formatDateTime(active.task.deadline)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-navy-900" />
                <p className="text-sm font-medium text-ink">{active.submission.versions.at(-1)!.fileName}</p>
              </div>
              <p className="text-xs text-muted">
                {active.submission.versions.at(-1)!.fileType} · {(active.submission.versions.at(-1)!.fileSizeKb / 1024).toFixed(1)} MB
              </p>
              {active.submission.versions.at(-1)!.remarks && (
                <div className="mt-3 flex items-start gap-2 text-[13px] text-muted">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p>{active.submission.versions.at(-1)!.remarks}</p>
                </div>
              )}
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-2">
                <History className="h-3.5 w-3.5" /> Version History
              </p>
              <div className="space-y-2">
                {active.submission.versions.map((v) => (
                  <div key={v.version} className="flex items-center justify-between rounded-lg bg-black/[0.02] px-3 py-2.5">
                    <div>
                      <p className="text-[13px] font-medium text-ink">Version {v.version}</p>
                      <p className="text-xs text-muted-2">Submitted {formatDateTime(v.submittedAt)}</p>
                      {v.reviewComment && <p className="text-xs text-muted mt-1 italic">"{v.reviewComment}"</p>}
                    </div>
                    <StatusBadge status={v.outcome === 'Pending' ? 'Under Review' : v.outcome} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Submission"
        subtitle="Add a comment describing what needs to change"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={reject} disabled={!comment.trim()}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <Field label="Review Comment" required hint="This will be visible to the teacher along with a resubmit option.">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Please update the Division B attendance section and resubmit."
            autoFocus
          />
        </Field>
      </Modal>
    </div>
  );
}
