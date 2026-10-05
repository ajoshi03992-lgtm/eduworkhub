import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, ClipboardList, FileText, Activity as ActivityIcon, FileCheck2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function GlobalSearch({ base }: { base: 'hod' | 'teacher' }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return null;
    const teachers = base === 'hod' ? state.teachers.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 5) : [];
    const tasks = state.tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5);
    const documents = state.documents.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 5);
    const activities = state.activities.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 5);
    return { teachers, tasks, documents, activities };
  }, [query, state, base]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted hover:border-navy-700/40 transition-colors w-40 sm:w-56"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search…</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl animate-fade-in overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
              <Search className="h-4 w-4 text-muted shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={base === 'hod' ? 'Search teachers, tasks, documents, activities…' : 'Search tasks, documents, activities…'}
                className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted-2"
              />
              <button onClick={() => setOpen(false)} className="text-muted-2 hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto py-2">
              {!results && <p className="px-4 py-6 text-center text-sm text-muted">Start typing to search across the system.</p>}
              {results && (
                <>
                  <SearchGroup
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Teachers"
                    items={results.teachers.map((t) => ({ id: t.id, label: t.name, sub: t.subjects.join(', ') }))}
                    onSelect={(id) => {
                      navigate(`/hod/teachers/${id}`);
                      setOpen(false);
                    }}
                  />
                  <SearchGroup
                    icon={<ClipboardList className="h-3.5 w-3.5" />}
                    label="Tasks"
                    items={results.tasks.map((t) => ({ id: t.id, label: t.title, sub: t.status }))}
                    onSelect={() => {
                      navigate(base === 'hod' ? '/hod/work' : '/teacher/tasks');
                      setOpen(false);
                    }}
                  />
                  <SearchGroup
                    icon={<FileText className="h-3.5 w-3.5" />}
                    label="Documents"
                    items={results.documents.map((d) => ({ id: d.id, label: d.name, sub: d.category }))}
                    onSelect={() => {
                      navigate(`/${base}/documents`);
                      setOpen(false);
                    }}
                  />
                  <SearchGroup
                    icon={<ActivityIcon className="h-3.5 w-3.5" />}
                    label="Activities"
                    items={results.activities.map((a) => ({ id: a.id, label: a.title, sub: a.date }))}
                    onSelect={() => {
                      navigate(base === 'hod' ? '/hod/activity-log' : '/teacher/daily-activity');
                      setOpen(false);
                    }}
                  />
                  {results.teachers.length + results.tasks.length + results.documents.length + results.activities.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-muted">No results found for "{query}".</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  icon,
  label,
  items,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  items: { id: string; label: string; sub?: string }[];
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="px-2 py-1.5">
      <p className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-2">
        {icon}
        {label}
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left hover:bg-black/[0.04] transition-colors"
        >
          <span className="text-sm text-ink">{item.label}</span>
          {item.sub && <span className="text-xs text-muted">{item.sub}</span>}
        </button>
      ))}
    </div>
  );
}

// FileCheck2 imported for future submission search grouping (kept for icon parity).
void FileCheck2;
