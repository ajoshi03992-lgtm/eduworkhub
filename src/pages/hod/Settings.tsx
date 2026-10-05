import { useState } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Misc';
import { Field, Input, Toggle } from '../../components/ui/Form';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Misc';

export function HodSettings() {
  const { state, resetDemo, pushToast } = useApp();
  const user = state.currentUser!;
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your profile and system preferences.</p>
      </div>

      <Card>
        <CardHeader title="Profile" subtitle="Your HOD account details" />
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={user.name} color={user.avatarColor} size="lg" />
          <div>
            <p className="font-medium text-ink">{user.name}</p>
            <p className="text-sm text-muted">
              {user.designation} · {user.employeeId}
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Button className="mt-4" size="sm" onClick={() => pushToast({ variant: 'success', title: 'Profile updated' })}>
          Save Changes
        </Button>
      </Card>

      <Card>
        <CardHeader title="Notification Preferences" />
        <div className="space-y-4">
          <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="Email alerts" description="Get notified by email for new submissions" />
          <Toggle checked={overdueAlerts} onChange={setOverdueAlerts} label="Overdue task alerts" description="Daily summary of overdue work" />
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly digest" description="Weekly department summary every Monday" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Security" icon={<ShieldCheck />} subtitle="Production-ready structure" />
        <Alert tone="info" title="Backend integration placeholders">
          Authentication in this demo uses fixed local credentials. A production deployment would authenticate via JWT
          issued by a backend <span className="font-mono">/auth/login</span> endpoint, enforce role-based authorization on
          every API route, hash and salt passwords server-side, validate file type/size on upload, and store documents in
          secure, access-controlled storage.
        </Alert>
      </Card>

      <Card>
        <CardHeader title="Demo Data" subtitle="Reset the workspace back to its original seeded state" />
        <Button variant="outline" icon={<RotateCcw />} onClick={resetDemo}>
          Reset Demo Data
        </Button>
      </Card>
    </div>
  );
}
