import { useState } from 'react';
import { Mail, Phone, BadgeCheck, CalendarDays, BookMarked } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { teacherLiveStats } from '../../lib/selectors';
import { Card, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Misc';
import { StatusBadge } from '../../components/ui/Badge';
import { Field, Input } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/utils';

export function Profile() {
  const { state, updateTeacher, pushToast } = useApp();
  const user = state.currentUser!;
  const teacher = state.teachers.find((t) => t.id === user.id)!;
  const stats = teacherLiveStats(state, teacher);
  const [phone, setPhone] = useState(teacher.phone ?? '');

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">My Profile</h1>
        <p className="text-sm text-muted mt-0.5">Your faculty profile as visible to the HOD.</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar name={teacher.name} color={teacher.avatarColor} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-lg font-bold text-ink">{teacher.name}</h2>
              <StatusBadge status={teacher.status} />
            </div>
            <p className="text-sm text-muted mt-1">
              {teacher.designation} · {teacher.department}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-[13px] text-muted">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" /> {teacher.employeeId}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {teacher.email}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(teacher.joinDate)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {teacher.subjects.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md bg-navy-100 text-navy-900 text-xs font-medium px-2 py-1">
                  <BookMarked className="h-3 w-3" /> {s}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {[
              ['Assigned', stats.assigned],
              ['Completed', stats.completed],
              ['Completion', `${stats.completionRate}%`],
            ].map(([label, value]) => (
              <div key={label as string} className="text-center">
                <p className="font-display text-lg font-bold text-ink">{value}</p>
                <p className="text-[11px] text-muted-2 whitespace-nowrap">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Contact Details" icon={<Phone />} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone Number">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email" hint="Managed by the department">
            <Input value={teacher.email} disabled />
          </Field>
        </div>
        <Button
          className="mt-4"
          size="sm"
          onClick={() => {
            updateTeacher(teacher.id, { phone });
            pushToast({ variant: 'success', title: 'Contact details updated' });
          }}
        >
          Save Changes
        </Button>
      </Card>
    </div>
  );
}
