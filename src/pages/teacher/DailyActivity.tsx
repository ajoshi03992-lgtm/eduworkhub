import { useMemo, useState } from 'react';
import { Plus, CalendarCheck2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select, Textarea, Checkbox } from '../../components/ui/Form';
import { EmptyState } from '../../components/ui/Misc';
import { formatDateLong } from '../../lib/utils';
import type { ActivityCategory } from '../../types';

const CATEGORIES: ActivityCategory[] = ['Lecture', 'Evaluation', 'Meeting', 'Documentation', 'Report', 'Other'];

export function DailyActivity() {
  const { state, addActivity } = useApp();
  const user = state.currentUser!;
  const teacher = state.teachers.find((t) => t.id === user.id);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Lecture');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(state.today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [relatedSubject, setRelatedSubject] = useState(teacher?.subjects[0] ?? '');
  const [attachDocument, setAttachDocument] = useState(false);
  const [remarks, setRemarks] = useState('');

  const activities = useMemo(
    () => state.activities.filter((a) => a.teacherId === user.id).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [state.activities, user.id],
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof activities> = {};
    activities.forEach((a) => {
      (map[a.date] ??= []).push(a);
    });
    return Object.entries(map);
  }, [activities]);

  function handleSave() {
    addActivity({
      teacherId: user.id,
      title,
      category,
      description,
      date,
      startTime,
      endTime,
      relatedSubject,
      hasAttachment: attachDocument,
      remarks,
    });
    setOpen(false);
    setTitle('');
    setDescription('');
    setRemarks('');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Daily Activity</h1>
          <p className="text-sm text-muted mt-0.5">Log your day-to-day work so the HOD always has visibility.</p>
        </div>
        <Button icon={<Plus />} onClick={() => setOpen(true)}>
          Add Activity
        </Button>
      </div>

      <Card>
        <CardHeader title="Activity Timeline" icon={<CalendarCheck2 />} />
        {grouped.length === 0 ? (
          <EmptyState title="No activity logged yet" description="Click 'Add Activity' to record your first entry." />
        ) : (
          <div className="relative pl-5 border-l-2 border-border space-y-6">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <p className="text-[13px] font-semibold text-ink -ml-5 pl-5 relative before:content-[''] before:absolute before:-left-[9px] before:top-1.5 before:h-3 before:w-3 before:rounded-full before:bg-navy-900">
                  {formatDateLong(date)}
                </p>
                <div className="mt-2.5 space-y-2.5">
                  {items.map((a) => (
                    <div key={a.id} className="flex items-start justify-between rounded-lg bg-black/[0.02] px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium text-ink">{a.title}</p>
                        <p className="text-xs text-muted-2 mt-0.5">
                          {a.category} {a.relatedSubject ? `· ${a.relatedSubject}` : ''} {a.startTime ? `· ${a.startTime}–${a.endTime}` : ''}
                        </p>
                        {a.description && <p className="text-xs text-muted mt-1">{a.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Activity"
        subtitle="Log a piece of work you completed"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title}>
              Save Activity
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Activity Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. DBMS Lecture" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Related Subject">
              <Select value={relatedSubject} onChange={(e) => setRelatedSubject(e.target.value)}>
                {(teacher?.subjects ?? []).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did this activity involve?" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Start Time">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field label="End Time">
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>
          <Checkbox checked={attachDocument} onChange={setAttachDocument} label="Attach supporting document (simulated)" />
          <Field label="Remarks">
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
