import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Pencil, UserX, UserCheck2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { teacherLiveStats } from '../../lib/selectors';
import { Card } from '../../components/ui/Card';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input, Field, Select } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { SUBJECTS, CLASS_DIVISIONS, DESIGNATIONS, AVATAR_COLORS } from '../../data/pools';

export function Teachers() {
  const { state, addTeacher, updateTeacher, deactivateTeacher } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return state.teachers
      .map((t) => ({ teacher: t, stats: teacherLiveStats(state, t) }))
      .filter(({ teacher }) => {
        const matchesSearch =
          teacher.name.toLowerCase().includes(search.toLowerCase()) ||
          teacher.employeeId.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || teacher.status === statusFilter;
        const matchesSubject = subjectFilter === 'All' || teacher.subjects.includes(subjectFilter);
        return matchesSearch && matchesStatus && matchesSubject;
      });
  }, [state, search, statusFilter, subjectFilter]);

  const editingTeacher = editId ? state.teachers.find((t) => t.id === editId) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Teachers</h1>
          <p className="text-sm text-muted mt-0.5">{state.teachers.length} faculty members in the Department of Computer Science</p>
        </div>
        <Button icon={<Plus />} onClick={() => setAddOpen(true)}>
          Add Teacher
        </Button>
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2.5 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or employee ID…" className="pl-9" />
          </div>
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="sm:w-48">
            <option value="All">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No teachers found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-black/[0.015] text-left text-[11.5px] uppercase tracking-wide text-muted-2">
                  <th className="px-5 py-2.5 font-medium">Teacher</th>
                  <th className="px-3 py-2.5 font-medium">Subjects</th>
                  <th className="px-3 py-2.5 font-medium text-center">Assigned</th>
                  <th className="px-3 py-2.5 font-medium text-center">Completion</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Work Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ teacher, stats }) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-border last:border-0 hover:bg-black/[0.015] cursor-pointer"
                    onClick={() => navigate(`/hod/teachers/${teacher.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={teacher.name} color={teacher.avatarColor} size="sm" />
                        <div>
                          <p className="font-medium text-ink whitespace-nowrap">{teacher.name}</p>
                          <p className="text-xs text-muted-2">{teacher.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted whitespace-nowrap">{teacher.subjects.join(', ')}</td>
                    <td className="px-3 py-3 text-center">{stats.assigned}</td>
                    <td className="px-3 py-3 text-center font-medium">{stats.completionRate}%</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={teacher.status} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={teacher.currentStatus} />
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={() => (
                          <button className="p-1.5 rounded-lg hover:bg-black/[0.05] text-muted">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        )}
                      >
                        {(close) => (
                          <>
                            <DropdownItem
                              icon={<Pencil />}
                              onClick={() => {
                                setEditId(teacher.id);
                                close();
                              }}
                            >
                              Edit Teacher
                            </DropdownItem>
                            <DropdownItem
                              icon={teacher.status === 'Inactive' ? <UserCheck2 /> : <UserX />}
                              danger={teacher.status !== 'Inactive'}
                              onClick={() => {
                                deactivateTeacher(teacher.id);
                                close();
                              }}
                            >
                              {teacher.status === 'Inactive' ? 'Reactivate' : 'Deactivate'}
                            </DropdownItem>
                          </>
                        )}
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <TeacherFormModal
        open={addOpen || !!editingTeacher}
        onClose={() => {
          setAddOpen(false);
          setEditId(null);
        }}
        onSubmit={(data) => {
          if (editingTeacher) {
            updateTeacher(editingTeacher.id, data);
          } else {
            addTeacher({ ...data, phone: undefined });
          }
          setAddOpen(false);
          setEditId(null);
        }}
        initial={editingTeacher ?? undefined}
      />
    </div>
  );
}

function TeacherFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    employeeId: string;
    department: string;
    designation: string;
    subjects: string[];
    classes: string[];
    avatarColor: string;
    joinDate: string;
    status: 'Active' | 'On Leave' | 'Inactive';
  }) => void;
  initial?: {
    name: string;
    email: string;
    employeeId: string;
    designation: string;
    subjects: string[];
    classes: string[];
  };
}) {
  const [name, setName] = useState(initial?.name?.replace('Prof. ', '') ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? '');
  const [designation, setDesignation] = useState(initial?.designation ?? DESIGNATIONS[0]);
  const [subject, setSubject] = useState(initial?.subjects?.[0] ?? SUBJECTS[0]);
  const [className, setClassName] = useState(initial?.classes?.[0] ?? CLASS_DIVISIONS[0]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Teacher' : 'Add Teacher'}
      subtitle={initial ? 'Update faculty profile details' : 'Add a new faculty member to the department'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                name: name.startsWith('Prof.') ? name : `Prof. ${name}`,
                email,
                employeeId,
                department: 'Computer Science',
                designation,
                subjects: [subject],
                classes: [className],
                avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
                joinDate: new Date().toISOString().slice(0, 10),
                status: 'Active',
              })
            }
            disabled={!name || !email || !employeeId}
          >
            {initial ? 'Save Changes' : 'Add Teacher'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Full Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kiran Bhat" />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kiran@abccollege.edu" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employee ID" required>
            <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="CS-133" />
          </Field>
          <Field label="Designation">
            <Select value={designation} onChange={(e) => setDesignation(e.target.value)}>
              {DESIGNATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Subject">
            <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Class">
            <Select value={className} onChange={(e) => setClassName(e.target.value)}>
              {CLASS_DIVISIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
        {!initial && (
          <p className="text-xs text-muted-2 bg-black/[0.03] rounded-lg px-3 py-2">
            New teachers sign in with the default demo password <span className="font-mono">teacher123</span>.
          </p>
        )}
      </div>
    </Modal>
  );
}
