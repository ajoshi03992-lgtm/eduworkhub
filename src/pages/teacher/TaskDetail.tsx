import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, FileText, PlayCircle, History, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea, Field } from '../../components/ui/Form';
import { Alert, EmptyState } from '../../components/ui/Misc';
import { formatDate, formatDateTime } from '../../lib/utils';

const ACCEPTED = ['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.png'];

export function TeacherTaskDetail() {
  const { id } = useParams();
  const { state, startTask, submitWork } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [fileError, setFileError] = useState('');

  const task = state.tasks.find((t) => t.id === id);
  const submission = state.submissions.find((s) => s.taskId === id && s.teacherId === user.id);
  const hod = state.hod;

  if (!task) {
    return (
      <EmptyState
        title="Task not found"
        action={
          <button onClick={() => navigate('/teacher/tasks')} className="text-sm font-medium text-navy-900 hover:underline">
            Back to My Tasks
          </button>
        }
      />
    );
  }

  function handleFilePick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setFileError(`Unsupported file type. Accepted: ${ACCEPTED.join(', ')}`);
      setFileName('');
      return;
    }
    setFileError('');
    setFileName(file.name);
  }

  function handleSubmit() {
    if (!task) return;
    if (task.requiresFile && !fileName) {
      setFileError('Please attach the required document before submitting.');
      return;
    }
    const ext = fileName ? fileName.split('.').pop()?.toUpperCase() ?? 'PDF' : 'PDF';
    submitWork(task.id, user.id, fileName || `${task.title.replace(/\s+/g, '_')}.pdf`, ext, remarks);
    setFileName('');
    setRemarks('');
  }

  const canSubmit = ['Assigned', 'In Progress', 'Rejected'].includes(task.status);

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate('/teacher/tasks')} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to My Tasks
      </button>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{task.title}</h1>
            <p className="text-sm text-muted mt-1">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border text-[13px]">
          <div>
            <p className="text-muted-2 text-xs">Assigned By</p>
            <p className="font-medium text-ink mt-0.5">{hod.name}</p>
          </div>
          <div>
            <p className="text-muted-2 text-xs">Assigned Date</p>
            <p className="font-medium text-ink mt-0.5">{formatDate(task.startDate)}</p>
          </div>
          <div>
            <p className="text-muted-2 text-xs">Deadline</p>
            <p className="font-medium text-ink mt-0.5">{formatDate(task.deadline)}</p>
          </div>
          <div>
            <p className="text-muted-2 text-xs">Category</p>
            <p className="font-medium text-ink mt-0.5">{task.category}</p>
          </div>
        </div>

        {task.instructions && (
          <div className="mt-4">
            <Alert tone="info" title="Instructions">
              {task.instructions}
            </Alert>
          </div>
        )}

        {task.status === 'Rejected' && submission && (
          <div className="mt-4">
            <Alert tone="danger" title="Changes requested">
              {submission.versions.at(-1)?.reviewComment}
            </Alert>
          </div>
        )}
      </Card>

      {task.status === 'Assigned' && (
        <Card>
          <p className="text-sm text-ink mb-3">Ready to begin? Mark this task as in progress to let the HOD know you've started.</p>
          <Button icon={<PlayCircle />} variant="outline" onClick={() => startTask(task.id)}>
            Start Task
          </Button>
        </Card>
      )}

      {canSubmit && (
        <Card>
          <CardHeader title={submission ? 'Resubmit Work' : 'Submit Work'} subtitle="Attach your document and add any remarks" />
          <div className="space-y-4">
            <Field label={task.requiresFile ? 'Required Document' : 'Attachment (optional)'} required={task.requiresFile}>
              <input ref={fileRef} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={handleFileChange} />
              <button
                onClick={handleFilePick}
                className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border px-4 py-4 text-left hover:border-navy-700/40 hover:bg-navy-100/10 transition-colors"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-900 shrink-0">
                  {fileName ? <FileText className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{fileName || 'Choose File'}</span>
                  <span className="block text-xs text-muted-2 mt-0.5">PDF, DOCX, XLSX, PPTX, JPG, PNG</span>
                </span>
              </button>
              {fileError && <p className="text-xs text-red-600 mt-1.5">{fileError}</p>}
            </Field>
            <Field label="Remarks" hint="Describe what you're submitting">
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Covers Division A and B for September." />
            </Field>
            <Button icon={<UploadCloud />} onClick={handleSubmit}>
              Submit Work
            </Button>
          </div>
        </Card>
      )}

      {submission && (
        <Card>
          <CardHeader title="Version History" icon={<History />} />
          <div className="space-y-2.5">
            {submission.versions.map((v) => (
              <div key={v.version} className="rounded-lg bg-black/[0.02] px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-ink">
                    Version {v.version} · {v.fileName}
                  </p>
                  <StatusBadge status={v.outcome === 'Pending' ? 'Under Review' : v.outcome} />
                </div>
                <p className="text-xs text-muted-2 mt-1">Submitted {formatDateTime(v.submittedAt)}</p>
                {v.reviewComment && (
                  <p className="text-xs text-muted mt-1.5 flex items-start gap-1.5">
                    <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" /> {v.reviewComment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
