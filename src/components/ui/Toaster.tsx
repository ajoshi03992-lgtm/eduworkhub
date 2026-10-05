import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { classNames } from '../../lib/utils';

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-accent-600" />,
  error: <XCircle className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
};

export function Toaster() {
  const { state, dismissToast } = useApp();
  if (state.toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2.5rem))]">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={classNames(
            'animate-toast-in flex items-start gap-3 rounded-xl border border-border bg-surface shadow-lg p-4',
          )}
        >
          <span className="shrink-0 mt-0.5">{ICONS[toast.variant]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{toast.title}</p>
            {toast.description && <p className="text-[13px] text-muted mt-0.5">{toast.description}</p>}
          </div>
          <button onClick={() => dismissToast(toast.id)} className="shrink-0 text-muted-2 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
