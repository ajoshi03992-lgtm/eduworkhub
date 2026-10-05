import React from 'react';
import { classNames } from '../../lib/utils';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'navy';

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-black/[0.05] text-muted',
  success: 'bg-accent-50 text-accent-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  navy: 'bg-navy-100 text-navy-900',
};

const dotStyles: Record<BadgeTone, string> = {
  neutral: 'bg-muted-2',
  success: 'bg-accent-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
  info: 'bg-blue-600',
  navy: 'bg-navy-800',
};

export function Badge({
  children,
  tone = 'neutral',
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium leading-5 whitespace-nowrap',
        toneStyles[tone],
        className,
      )}
    >
      {dot && <span className={classNames('h-1.5 w-1.5 rounded-full', dotStyles[tone])} />}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Assigned: 'neutral',
  'In Progress': 'info',
  Submitted: 'info',
  'Under Review': 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Overdue: 'danger',
  Active: 'success',
  'Needs Attention': 'warning',
  'On Leave': 'neutral',
  Inactive: 'neutral',
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Urgent: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? 'neutral'} dot>
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge tone={STATUS_TONE[priority] ?? 'neutral'}>{priority}</Badge>;
}
