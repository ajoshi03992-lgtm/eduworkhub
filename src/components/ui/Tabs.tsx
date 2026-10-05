import { classNames } from '../../lib/utils';

export function Tabs({
  tabs,
  active,
  onChange,
  counts,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={classNames(
            'relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors',
            active === tab ? 'text-navy-900' : 'text-muted hover:text-ink',
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab}
            {counts && counts[tab] !== undefined && (
              <span
                className={classNames(
                  'inline-flex items-center justify-center rounded-full px-1.5 min-w-[18px] h-[18px] text-[11px] font-semibold',
                  active === tab ? 'bg-navy-100 text-navy-900' : 'bg-black/[0.05] text-muted',
                )}
              >
                {counts[tab]}
              </span>
            )}
          </span>
          {active === tab && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-navy-900 rounded-full" />}
        </button>
      ))}
    </div>
  );
}
