import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, AlertCircle, ClipboardCheck, BarChart3, FileCheck2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Input, Field, Checkbox } from '../../components/ui/Form';
import { classNames } from '../../lib/utils';
import type { Role } from '../../types';

export function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('HOD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  function fillDemo(demoRole: Role) {
    setRole(demoRole);
    setError('');
    if (demoRole === 'HOD') {
      setEmail('hod@abccollege.edu');
      setPassword('hod123');
    } else {
      setEmail('rahul@abccollege.edu');
      setPassword('teacher123');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password, role);
      setLoading(false);
      if (result.ok) {
        navigate(role === 'HOD' ? '/hod/dashboard' : '/teacher/dashboard');
      } else {
        setError(result.error ?? 'Invalid credentials. Please try again.');
      }
    }, 650);
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-2/5 flex-col justify-between bg-navy-950 text-white px-12 py-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-600/10" />
        <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-white/[0.03]" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600">
              <GraduationCap className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">EduWorkHub</p>
              <p className="text-[12px] text-white/50 leading-tight">College Faculty Work Management System</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-display text-[28px] xl:text-[32px] font-bold leading-[1.15] max-w-md">
            One place for every teacher's work, and everything the HOD needs to know about it.
          </h2>
          <p className="text-white/60 text-[14.5px] mt-4 max-w-sm leading-relaxed">
            Assign work, track submissions, review documents and generate department reports —
            without a single follow-up phone call.
          </p>

          <div className="mt-9 space-y-4">
            <FeatureRow icon={<ClipboardCheck className="h-4 w-4" />} text="Assign, track and approve faculty work end to end" />
            <FeatureRow icon={<FileCheck2 className="h-4 w-4" />} text="Centralized documents, submissions and version history" />
            <FeatureRow icon={<BarChart3 className="h-4 w-4" />} text="Live department analytics and one-click reports" />
          </div>
        </div>

        <p className="relative text-[12px] text-white/35">ABC College of Science &amp; Technology · Department of Computer Science</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-ink leading-tight">EduWorkHub</p>
              <p className="text-[11px] text-muted leading-tight">Faculty Work Management</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink">Sign in to your account</h1>
          <p className="text-sm text-muted mt-1.5">Enter your credentials to access the department workspace.</p>

          <div className="mt-6 flex rounded-xl bg-black/[0.04] p-1">
            {(['HOD', 'TEACHER'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setError('');
                }}
                className={classNames(
                  'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                  role === r ? 'bg-white text-navy-900 shadow-sm' : 'text-muted hover:text-ink',
                )}
              >
                {r === 'HOD' ? 'HOD' : 'Teacher'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-[13px] text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <Field label="Email address" required>
              <Input
                type="email"
                placeholder={role === 'HOD' ? 'hod@abccollege.edu' : 'rahul@abccollege.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
              <button type="button" onClick={() => setForgotOpen(true)} className="text-[13px] font-medium text-navy-900 hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          {forgotOpen && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
              Password reset links are sent by your system administrator. For this demo, use the credentials below.
              <button onClick={() => setForgotOpen(false)} className="block mt-1.5 font-medium underline underline-offset-2">
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-7 rounded-xl border border-border bg-white p-4">
            <p className="text-[13px] font-semibold text-ink mb-3">Demo credentials</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => fillDemo('HOD')}
                type="button"
                className="text-left rounded-lg border border-border px-3 py-2.5 hover:border-navy-700/40 hover:bg-navy-100/20 transition-colors"
              >
                <p className="text-xs font-semibold text-ink">HOD</p>
                <p className="text-[11.5px] text-muted mt-0.5">hod@abccollege.edu</p>
                <p className="text-[11.5px] text-muted-2">hod123</p>
              </button>
              <button
                onClick={() => fillDemo('TEACHER')}
                type="button"
                className="text-left rounded-lg border border-border px-3 py-2.5 hover:border-navy-700/40 hover:bg-navy-100/20 transition-colors"
              >
                <p className="text-xs font-semibold text-ink">Teacher</p>
                <p className="text-[11.5px] text-muted mt-0.5">rahul@abccollege.edu</p>
                <p className="text-[11.5px] text-muted-2">teacher123</p>
              </button>
            </div>
            <p className="text-[11px] text-muted-2 mt-3">Demo credentials only — not connected to a real directory.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 shrink-0">{icon}</span>
      <span className="text-[13.5px] text-white/75">{text}</span>
    </div>
  );
}
