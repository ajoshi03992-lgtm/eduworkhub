import React from 'react';
import { classNames, initials } from '../../lib/utils';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.04] text-muted-2 mb-4 [&>svg]:h-6 [&>svg]:w-6">
        {icon ?? <Inbox />}
      </div>
      <p className="font-display font-semibold text-ink text-[15px]">{title}</p>
      {description && <p className="text-sm text-muted mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('rounded-lg bg-black/[0.06] animate-skeleton', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-20 shrink-0" />
          <Skeleton className="h-3.5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function Avatar({ name, color, size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' };
  return (
    <div
      className={classNames('flex items-center justify-center rounded-full font-semibold text-white shrink-0', sizes[size])}
      style={{ backgroundColor: color ?? '#16294F' }}
    >
      {initials(name.replace(/^(Prof\.|Dr\.)\s*/, ''))}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const iconTones = {
    neutral: 'bg-navy-100 text-navy-900',
    success: 'bg-accent-50 text-accent-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  };
  const trendColor = trend?.direction === 'up' ? 'text-accent-700' : trend?.direction === 'down' ? 'text-red-600' : 'text-muted';
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={classNames('flex h-8 w-8 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4', iconTones[tone])}>
          {icon}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-display text-[26px] font-bold text-ink leading-none">{value}</span>
        {trend && <span className={classNames('text-xs font-medium', trendColor)}>{trend.label}</span>}
      </div>
    </div>
  );
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  children?: React.ReactNode;
}) {
  const tones = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    danger: 'bg-red-50 border-red-100 text-red-700',
    success: 'bg-accent-50 border-accent-100 text-accent-700',
  };
  return (
    <div className={classNames('rounded-xl border px-4 py-3', tones[tone])}>
      <p className="text-sm font-semibold">{title}</p>
      {children && <div className="text-[13px] mt-1 opacity-90">{children}</div>}
    </div>
  );
}
