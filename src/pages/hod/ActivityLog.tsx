import { useMemo, useState } from 'react';
import { Search, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Form';
import { EmptyState } from '../../components/ui/Misc';
import { formatDateTime } from '../../lib/utils';

export function ActivityLogPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');

  const rows = useMemo(
    () =>
      state.auditLog
        .filter((a) => (entityFilter === 'All' ? true : a.entityType === entityFilter))
        .filter((a) => a.action.toLowerCase().includes(search.toLowerCase()) || a.actorName.toLowerCase().includes(search.toLowerCase())),
    [state.auditLog, search, entityFilter],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Activity / Audit Log</h1>
        <p className="text-sm text-muted mt-0.5">A complete, accountable history of every action taken in the system.</p>
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2.5 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by actor or action…" className="pl-9" />
          </div>
          <Select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="sm:w-44">
            <option value="All">All Entities</option>
            {['Task', 'Submission', 'Teacher', 'Document', 'Report', 'Activity'].map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<History />} title="No matching activity" />
        ) : (
          <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
            {rows.slice(0, 100).map((a) => (
              <div key={a.id} className="flex items-start gap-3.5 px-5 py-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-900 text-[11px] font-semibold shrink-0 mt-0.5">
                  {a.entityType.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] text-ink">
                    <span className="font-medium">{a.actorName}</span> {a.action}
                  </p>
                  <p className="text-xs text-muted-2 mt-0.5">{formatDateTime(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
