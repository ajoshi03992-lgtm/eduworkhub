import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tasksForTeacher } from '../../lib/selectors';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Form';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/Misc';
import { formatDate } from '../../lib/utils';

const TABS = ['All', 'Assigned', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Overdue'];

export function MyTasks() {
  const { state } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  const tasks = useMemo(() => tasksForTeacher(state, user.id), [state, user.id]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (tab !== 'All') list = list.filter((t) => t.status === tab);
    if (search) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => (a.deadline > b.deadline ? 1 : -1));
  }, [tasks, tab, search]);

  const counts: Record<string, number> = { All: tasks.length };
  TABS.slice(1).forEach((s) => (counts[s] = tasks.filter((t) => t.status === s).length));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">My Tasks</h1>
        <p className="text-sm text-muted mt-0.5">Everything assigned to you by the department.</p>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-1 overflow-x-auto">
          <Tabs tabs={TABS} active={tab} onChange={setTab} counts={counts} />
        </div>
        <div className="px-5 py-3.5 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search my tasks…" className="pl-8 py-1.5 text-[13px]" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList />} title="No tasks in this view" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Task</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">Assigned</th>
                  <th className="px-3 py-2.5 font-medium">Deadline</th>
                  <th className="px-3 py-2.5 font-medium">Priority</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-black/[0.015]">
                    <td className="px-5 py-3 font-medium text-ink whitespace-nowrap">{t.title}</td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{t.category}</td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{formatDate(t.startDate)}</td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{formatDate(t.deadline)}</td>
                    <td className="px-3 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => navigate(`/teacher/tasks/${t.id}`)} className="text-xs font-medium text-navy-900 hover:underline">
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
