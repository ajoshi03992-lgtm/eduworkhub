import { useMemo, useRef, useState } from 'react';
import { Search, FolderOpen, FileText, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { DOCUMENT_STRUCTURE } from '../../data/pools';
import { formatDate } from '../../lib/utils';
import type { DocumentCategory } from '../../types';

const CATEGORIES = Object.keys(DOCUMENT_STRUCTURE) as DocumentCategory[];

export function TeacherDocuments() {
  const { state, addDocument } = useApp();
  const user = state.currentUser!;
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const documents = useMemo(
    () =>
      state.documents
        .filter((d) => d.teacherId === user.id)
        .filter((d) => (category === 'All' ? true : d.category === category))
        .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1)),
    [state.documents, user.id, search, category],
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() ?? 'PDF').toUpperCase();
    addDocument({
      name: file.name,
      category: CATEGORIES[0],
      subFolder: DOCUMENT_STRUCTURE[CATEGORIES[0]][0],
      teacherId: user.id,
      fileType: ext as never,
      sizeKb: Math.max(50, Math.round(file.size / 1024)),
    });
    e.target.value = '';
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">My Documents</h1>
          <p className="text-sm text-muted mt-0.5">{documents.length} documents on file.</p>
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        <Button icon={<UploadCloud />} onClick={() => fileRef.current?.click()}>
          Upload Document
        </Button>
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2.5 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search my documents…" className="pl-9" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>

        {documents.length === 0 ? (
          <EmptyState icon={<FolderOpen />} title="No documents yet" description="Documents you upload or submit will appear here." />
        ) : (
          <div className="divide-y divide-border">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-900 shrink-0">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink truncate">{d.name}</p>
                  <p className="text-xs text-muted-2 mt-0.5">
                    {d.category} · {d.fileType} · {formatDate(d.uploadedAt.slice(0, 10))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
