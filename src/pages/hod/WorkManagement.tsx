import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, LayoutTemplate, RefreshCcw, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { CreateTaskInput } from '../../context/AppContext';
import type { TaskCategory, TaskPriority } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Field, Select, Textarea, Toggle, Checkbox } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { formatDate } from '../../lib/utils';

const CATEGORIES: TaskCategory[] = [
  'Academic',
  'Department',
  'Administrative',
  'Student Activity',
  'Documentation',
  'Examination',
  'Event',
  'Other',
];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

const VIEW_TABS = ['All Work', 'Assigned', 'Pending', 'Under Review', 'Overdue', 'Recurring', 'Templates'];

export function WorkManagement() {
  const { state, createTask } = useApp();
  const [tab, setTab] = useState('All Work');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<CreateTaskInput> | null>(null);

  const tasks = useMemo(() => {
    let list = state.tasks;
    if (tab === 'Assigned') list = list.filter((t) => t.status === 'Assigned');
    else if (tab === 'Pending') list = list.filter((t) => ['Assigned', 'In Progress', 'Under Review', 'Rejected'].includes(t.status));
    else if (tab === 'Under Review') list = list.filter((t) => t.status === 'Under Review');
    else if (tab === 'Overdue') list = list.filter((t) => t.status === 'Overdue');
    else if (tab === 'Recurring') list = list.filter((t) => !!t.recurring);
    if (search) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [state.tasks, tab, search]);

  const counts = {
    'All Work': state.tasks.length,
    Assigned: state.tasks.filter((t) => t.status === 'Assigned').length,
    Pending: state.tasks.filter((t) => ['Assigned', 'In Progress', 'Under Review', 'Rejected'].includes(t.status)).length,
    'Under Review': state.tasks.filter((t) => t.status === 'Under Review').length,
    Overdue: state.tasks.filter((t) => t.status === 'Overdue').length,
    Recurring: state.tasks.filter((t) => !!t.recurring).length,
    Templates: state.taskTemplates.length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Work Management</h1>
          <p className="text-sm text-muted mt-0.5">Assign, track and review all faculty work in one place.</p>
        </div>
        <Button
          icon={<Plus />}
          onClick={() => {
            setPrefill(null);
            setCreateOpen(true);
          }}
        >
          Create Task
        </Button>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-1">
          <Tabs tabs={VIEW_TABS} active={tab} onChange={setTab} counts={counts} />
        </div>

        {tab === 'Templates' ? (
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {state.taskTemplates.map((tpl) => (
              <div key={tpl.id} className="rounded-xl border border-border p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-900 shrink-0">
                    <LayoutTemplate className="h-4 w-4" />
                  </span>
                  <p className="text-[13.5px] font-semibold text-ink leading-tight">{tpl.name}</p>
                </div>
                <p className="text-xs text-muted flex-1">{tpl.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <PriorityBadge priority={tpl.defaultPriority} />
                  <span className="text-[11px] text-muted-2">{tpl.category}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setPrefill({
                      title: tpl.name,
                      description: tpl.description,
                      category: tpl.category,
                      priority: tpl.defaultPriority,
                      requiresFile: tpl.requiresFile,
                      recurring: tpl.suggestedRecurrence,
                      templateId: tpl.id,
                    });
                    setCreateOpen(true);
                  }}
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-border">
              <div className="relative max-w-xs">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-8 py-1.5 text-[13px]" />
              </div>
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                title="No tasks here"
                description="Tasks matching this view will show up as they're assigned."
                action={
                  <Button size="sm" icon={<Plus />} onClick={() => setCreateOpen(true)}>
                    Create Task
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                      <th className="px-5 py-2.5 font-medium">Task</th>
                      <th className="px-3 py-2.5 font-medium">Category</th>
                      <th className="px-3 py-2.5 font-medium">Assigned To</th>
                      <th className="px-3 py-2.5 font-medium">Deadline</th>
                      <th className="px-3 py-2.5 font-medium">Priority</th>
                      <th className="px-3 py-2.5 font-medium">Status</th>
                      {tab === 'Recurring' && <th className="px-3 py-2.5 font-medium">Repeats</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 40).map((t) => {
                      const assignees = t.assignedTeacherIds.map((id) => state.teachers.find((x) => x.id === id)).filter(Boolean);
                      return (
                        <tr key={t.id} className="border-b border-border last:border-0 hover:bg-black/[0.015]">
                          <td className="px-5 py-3">
                            <p className="font-medium text-ink whitespace-nowrap">{t.title}</p>
                            <p className="text-xs text-muted-2 mt-0.5">Started {formatDate(t.startDate)}</p>
                          </td>
                          <td className="px-3 py-3 text-muted whitespace-nowrap">{t.category}</td>
                          <td className="px-3 py-3">
                            <div className="flex -space-x-1.5">
                              {assignees.slice(0, 3).map(
                                (a) => a && <Avatar key={a.id} name={a.name} color={a.avatarColor} size="sm" />,
                              )}
                              {assignees.length > 3 && (
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.06] text-[10px] font-semibold text-muted">
                                  +{assignees.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-muted whitespace-nowrap">{formatDate(t.deadline)}</td>
                          <td className="px-3 py-3">
                            <PriorityBadge priority={t.priority} />
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={t.status} />
                          </td>
                          {tab === 'Recurring' && (
                            <td className="px-3 py-3 text-muted whitespace-nowrap flex items-center gap-1.5">
                              <RefreshCcw className="h-3 w-3" /> {t.recurring?.label}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} prefill={prefill} onCreate={createTask} />
    </div>
  );
}

function CreateTaskModal({
  open,
  onClose,
  prefill,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  prefill: Partial<CreateTaskInput> | null;
  onCreate: (input: CreateTaskInput) => void;
}) {
  const { state } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Academic');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(state.today);
  const [deadline, setDeadline] = useState(state.today);
  const [requiresFile, setRequiresFile] = useState(true);
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Monthly');
  const [dayOfMonth, setDayOfMonth] = useState(5);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [configuredMsg, setConfiguredMsg] = useState(false);

  function resetAndApplyPrefill() {
    setTitle(prefill?.title ?? '');
    setDescription(prefill?.description ?? '');
    setInstructions(prefill?.instructions ?? '');
    setCategory(prefill?.category ?? 'Academic');
    setPriority(prefill?.priority ?? 'Medium');
    setAssignees([]);
    setStartDate(state.today);
    setDeadline(state.today);
    setRequiresFile(prefill?.requiresFile ?? true);
    setRecurring(!!prefill?.recurring);
    setFrequency(prefill?.recurring?.frequency ?? 'Monthly');
    setDayOfMonth(prefill?.recurring?.dayOfMonth ?? 5);
    setConfiguredMsg(false);
  }

  useEffect(() => {
    if (open) {
      resetAndApplyPrefill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  if (!open) return null;

  const filteredTeachers = state.teachers.filter((t) => t.name.toLowerCase().includes(teacherSearch.toLowerCase()));

  function toggleAssignee(id: string) {
    setAssignees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleCreate() {
    onCreate({
      title,
      description,
      instructions,
      category,
      priority,
      assignedTeacherIds: assignees,
      startDate,
      deadline,
      requiresFile,
      recurring: recurring ? { frequency, dayOfMonth, label: `${frequency}` === 'Monthly' ? `${dayOfMonth}${ordinal(dayOfMonth)} of every month` : `Every ${frequency.toLowerCase()}` } : undefined,
      templateId: prefill?.templateId,
    });
    if (recurring) {
      setConfiguredMsg(true);
      setTimeout(() => {
        onClose();
        resetAndApplyPrefill();
      }, 900);
    } else {
      onClose();
      resetAndApplyPrefill();
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
      }}
      title="Create Task"
      subtitle="Assign new work to one or more teachers"
      width="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title || !description || assignees.length === 0 || !deadline}>
            {recurring ? 'Configure Recurring Task' : 'Create & Assign Task'}
          </Button>
        </>
      }
    >
      {configuredMsg ? (
        <div className="rounded-xl bg-accent-50 border border-accent-100 text-accent-700 px-4 py-6 text-center font-medium">
          Recurring task configured successfully.
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Task Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Internal Assessment Report" />
          </Field>
          <Field label="Description" required>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this task cover?" />
          </Field>
          <Field label="Instructions" hint="Optional guidance shown to the teacher">
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Attach the supporting file and add remarks…" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Deadline" required>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
          </div>

          <Field label="Assigned Teacher(s)" required>
            <Input
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search teacher to assign…"
              className="mb-2"
            />
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {filteredTeachers.slice(0, 25).map((t) => (
                <label key={t.id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-black/[0.02]">
                  <Checkbox checked={assignees.includes(t.id)} onChange={() => toggleAssignee(t.id)} label={`${t.name} · ${t.subjects[0]}`} />
                </label>
              ))}
            </div>
            {assignees.length > 0 && <p className="text-xs text-muted mt-1.5">{assignees.length} teacher(s) selected</p>}
          </Field>

          <Toggle checked={requiresFile} onChange={setRequiresFile} label="Requires File Upload" description="Teacher must attach a document to submit" />
          <div className="rounded-xl border border-border p-3.5">
            <Toggle checked={recurring} onChange={setRecurring} label="Recurring Task" description="Automatically repeats on a schedule" />
            {recurring && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Field label="Frequency">
                  <Select value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </Select>
                </Field>
                {frequency === 'Monthly' && (
                  <Field label="Day of Month">
                    <Input type="number" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))} />
                  </Field>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
