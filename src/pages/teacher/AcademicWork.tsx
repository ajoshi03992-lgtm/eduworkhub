import { useMemo, useState } from 'react';
import { Plus, BookOpenCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Field, Input, Select, Textarea } from '../../components/ui/Form';
import { EmptyState } from '../../components/ui/Misc';
import { formatDate } from '../../lib/utils';

export function TeacherAcademicWork() {
  const { state, addAcademicRecord } = useApp();
  const user = state.currentUser!;
  const teacher = state.teachers.find((t) => t.id === user.id);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(teacher?.subjects?.[0] ?? '');
  const [classDivision, setClassDivision] = useState('');
  const [lectureDate, setLectureDate] = useState(state.today);
  const [topicCovered, setTopicCovered] = useState('');
  const [lectureType, setLectureType] = useState<'Theory' | 'Practical' | 'Tutorial'>('Theory');
  const [syllabusUnit, setSyllabusUnit] = useState('Unit 1');
  const [hours, setHours] = useState(1);
  const [remarks, setRemarks] = useState('');

  const records = useMemo(() => state.academicRecords.filter((r) => r.teacherId === user.id), [state.academicRecords, user.id]);
  const syllabus = useMemo(() => state.syllabusProgress.filter((s) => s.teacherId === user.id), [state.syllabusProgress, user.id]);

  function handleSave() {
    addAcademicRecord({
      teacherId: user.id,
      subject: subject || teacher?.subjects[0] || '',
      classDivision,
      lectureDate,
      topicCovered,
      lectureType,
      syllabusUnit,
      hours,
      remarks,
    });
    setOpen(false);
    setTopicCovered('');
    setRemarks('');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Academic Work</h1>
          <p className="text-sm text-muted mt-0.5">Record lectures and track syllabus progress.</p>
        </div>
        <Button icon={<Plus />} onClick={() => setOpen(true)}>
          Record Lecture
        </Button>
      </div>

      <Card>
        <CardHeader title="Syllabus Progress" icon={<BookOpenCheck />} />
        {syllabus.length === 0 ? (
          <EmptyState title="No syllabus data yet" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {syllabus.map((s) => (
              <div key={s.subject} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[13.5px] font-semibold text-ink">{s.subject}</p>
                  <span className="font-display text-lg font-bold text-accent-700">{s.overall}%</span>
                </div>
                {s.units.map((u) => (
                  <div key={u.name} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] text-muted-2 w-14 shrink-0">{u.name}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-black/[0.06] overflow-hidden">
                      <div className="h-full bg-accent-600 rounded-full" style={{ width: `${u.percent}%` }} />
                    </div>
                    <span className="text-[11px] text-muted-2 w-8 text-right">{u.percent}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Lecture Records" subtitle={`${records.length} records logged`} />
        </div>
        {records.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState title="No lecture records yet" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Topic</th>
                  <th className="px-3 py-2.5 font-medium">Subject</th>
                  <th className="px-3 py-2.5 font-medium">Class</th>
                  <th className="px-3 py-2.5 font-medium">Type</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-5 py-2.5 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{r.topicCovered}</td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{r.subject}</td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{r.classDivision}</td>
                    <td className="px-3 py-3 text-muted">{r.lectureType}</td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{formatDate(r.lectureDate)}</td>
                    <td className="px-5 py-3 text-muted">{r.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record Lecture"
        subtitle="Log a lecture, practical or tutorial session"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!topicCovered || !classDivision}>
              Save Record
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subject">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {(teacher?.subjects ?? []).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Class / Division" required>
              <Select value={classDivision} onChange={(e) => setClassDivision(e.target.value)}>
                <option value="">Select…</option>
                {(teacher?.classes ?? []).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Topic Covered" required>
            <Input value={topicCovered} onChange={(e) => setTopicCovered(e.target.value)} placeholder="e.g. Normalization — 3NF and BCNF" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Lecture Date">
              <Input type="date" value={lectureDate} onChange={(e) => setLectureDate(e.target.value)} />
            </Field>
            <Field label="Type">
              <Select value={lectureType} onChange={(e) => setLectureType(e.target.value as typeof lectureType)}>
                <option>Theory</option>
                <option>Practical</option>
                <option>Tutorial</option>
              </Select>
            </Field>
            <Field label="Hours">
              <Input type="number" min={1} max={4} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Syllabus Unit">
            <Select value={syllabusUnit} onChange={(e) => setSyllabusUnit(e.target.value)}>
              {['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="Remarks">
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
