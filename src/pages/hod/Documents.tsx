import { useMemo, useState } from 'react';
import { Search, FolderOpen, FileText, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Form';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { DOCUMENT_STRUCTURE } from '../../data/pools';
import { formatDate } from '../../lib/utils';

const CATEGORIES = Object.keys(DOCUMENT_STRUCTURE);

export function HodDocuments() {
  const { state, pushToast } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [teacherId, setTeacherId] = useState('All');
  const [fileType, setFileType] = useState('All');

  const rows = useMemo(() => {
    return state.documents
      .filter((d) => (category === 'All' ? true : d.category === category))
      .filter((d) => (teacherId === 'All' ? true : d.teacherId === teacherId))
      .filter((d) => (fileType === 'All' ? true : d.fileType === fileType))
      .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  }, [state.documents, search, category, teacherId, fileType]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Document Repository</h1>
        <p className="text-sm text-muted mt-0.5">{state.documents.length} documents across all faculty, organized by category.</p>
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2.5 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…" className="pl-9" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-44">
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="sm:w-48">
            <option value="All">All Teachers</option>
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <Select value={fileType} onChange={(e) => setFileType(e.target.value)} className="sm:w-32">
            <option value="All">All Types</option>
            {['PDF', 'DOCX', 'XLSX', 'PPTX', 'JPG', 'PNG'].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<FolderOpen />} title="No documents found" description="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Document</th>
                  <th className="px-3 py-2.5 font-medium">Teacher</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">Type</th>
                  <th className="px-3 py-2.5 font-medium">Uploaded</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 60).map((d) => {
                  const teacher = state.teachers.find((t) => t.id === d.teacherId);
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-black/[0.015]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-900 shrink-0">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate max-w-xs">{d.name}</p>
                            <p className="text-xs text-muted-2">{d.subFolder}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {teacher && (
                          <div className="flex items-center gap-2">
                            <Avatar name={teacher.name} color={teacher.avatarColor} size="sm" />
                            <span className="text-muted whitespace-nowrap">{teacher.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted whitespace-nowrap">{d.category}</td>
                      <td className="px-3 py-3 text-muted">{d.fileType}</td>
                      <td className="px-3 py-3 text-muted whitespace-nowrap">{formatDate(d.uploadedAt.slice(0, 10))}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => pushToast({ variant: 'info', title: 'Download started', description: d.name })}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-900 hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
