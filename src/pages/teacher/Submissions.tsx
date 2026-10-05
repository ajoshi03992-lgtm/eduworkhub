import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck2, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/Misc';
import { formatDateTime } from '../../lib/utils';

const TABS = ['All', 'Under Review', 'Approved', 'Rejected'];

export function TeacherSubmissions() {
  const { state } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [tab, setTab] = useState('All');

  const rows = useMemo(() => {
    let list = state.submissions.filter((s) => s.teacherId === user.id);
    if (tab !== 'All') list = list.filter((s) => s.status === tab);
    return list
      .map((s) => ({ submission: s, task: state.tasks.find((t) => t.id === s.taskId) }))
      .sort((a, b) => (a.submission.versions.at(-1)!.submittedAt < b.submission.versions.at(-1)!.submittedAt ? 1 : -1));
  }, [state, user.id, tab]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">My Submissions</h1>
        <p className="text-sm text-muted mt-0.5">Track the review status and version history of everything you've submitted.</p>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-1">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<FileCheck2 />} title="No submissions here" />
        ) : (
          <div className="divide-y divide-border">
            {rows.map(({ submission, task }) => (
              <button
                key={submission.id}
                onClick={() => task && navigate(`/teacher/tasks/${task.id}`)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-black/[0.015]"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-ink truncate">{task?.title}</p>
                  <p className="text-xs text-muted-2 mt-0.5 flex items-center gap-1.5">
                    <History className="h-3 w-3" /> v{submission.currentVersion} · Submitted{' '}
                    {formatDateTime(submission.versions.at(-1)!.submittedAt)}
                  </p>
                </div>
                <StatusBadge status={submission.status} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
