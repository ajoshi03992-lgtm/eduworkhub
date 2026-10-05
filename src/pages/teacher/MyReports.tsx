import { useState } from 'react';
import { FileBarChart, Printer, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/Misc';
import { ReportDocument } from '../../components/shared/ReportPreview';
import type { GeneratedReport } from '../../types';

export function MyReports() {
  const { state, generateReport } = useApp();
  const user = state.currentUser!;
  const [preview, setPreview] = useState<GeneratedReport | null>(null);

  const myReports = state.generatedReports.filter((r) => r.filters.teacherId === user.id);

  function handleGenerate() {
    const report = generateReport('Teacher Work Report', { teacherId: user.id }, 'September 2026');
    setPreview(report);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">My Reports</h1>
          <p className="text-sm text-muted mt-0.5">Generate a personal work summary you can share or print.</p>
        </div>
        <Button icon={<FileBarChart />} onClick={handleGenerate}>
          Generate My Work Report
        </Button>
      </div>

      <Card>
        <CardHeader title="Generated Reports" />
        {myReports.length === 0 ? (
          <EmptyState title="No reports generated yet" description="Click 'Generate My Work Report' to create your first summary." />
        ) : (
          <div className="space-y-2.5">
            {myReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{r.type}</p>
                  <p className="text-xs text-muted-2">{r.periodLabel}</p>
                </div>
                <Button size="sm" icon={<Download />} onClick={() => setPreview(r)}>
                  View / Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Report Preview"
        subtitle={preview?.type}
        width="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setPreview(null)}>
              Close
            </Button>
            <Button icon={<Printer />} onClick={() => window.print()}>
              Download / Print PDF
            </Button>
          </>
        }
      >
        {preview && (
          <div className="border border-border rounded-xl overflow-hidden bg-black/[0.015]">
            <ReportDocument report={preview} filterTeacherId={user.id} />
          </div>
        )}
      </Modal>
    </div>
  );
}
