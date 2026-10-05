import React, { useEffect, useRef, useState } from 'react';
import { classNames } from '../../lib/utils';

export function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-56',
}: {
  trigger: (open: boolean) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div
          className={classNames(
            'absolute z-40 mt-2 rounded-xl border border-border bg-surface shadow-xl py-1.5 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            width,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors [&>svg]:h-4 [&>svg]:w-4',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-ink hover:bg-black/[0.04]',
      )}
    >
      {icon}
      {children}
    </button>
  );
}
