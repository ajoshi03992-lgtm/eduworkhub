import React from 'react';
import { classNames } from '../../lib/utils';

export function Card({
  children,
  className,
  padded = true,
  as: Tag = 'div',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  as?: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <Tag
      onClick={onClick}
      className={classNames(
        'bg-surface rounded-2xl border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        padded && 'p-5',
        onClick && 'cursor-pointer transition-shadow hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-900 [&>svg]:h-[18px] [&>svg]:w-[18px]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-[15px] text-ink truncate">{title}</h3>
          {subtitle && <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
