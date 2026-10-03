import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../theme';

const openModals = [];

// footer stays pinned below the scrolling body; headerStart sits before the title (e.g. a back button).
// busy: a backend request is in flight — Esc, backdrop clicks and the close button are ignored,
// and leaving the page asks for confirmation, so the operation is never abandoned midway.
export default function Modal({ title, onClose, children, footer, headerStart, wide = false, busy = false }) {
  const { theme } = useTheme();
  const latest = useRef({ onClose, busy });
  useEffect(() => {
    latest.current = { onClose, busy };
  });
  const requestClose = () => {
    if (!latest.current.busy) latest.current.onClose();
  };

  // Esc closes only the top-most modal (e.g. a confirm dialog opened over a form).
  useEffect(() => {
    const token = {};
    openModals.push(token);
    const onKey = (e) => {
      if (e.key === 'Escape' && openModals[openModals.length - 1] === token) requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, []);

  // Reload / tab close while saving: let the browser show its "leave site?" prompt.
  useEffect(() => {
    if (!busy) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [busy]);

  // Close on backdrop only when the press also started there, so a text selection
  // dragged out of the dialog doesn't close it and lose the form.
  const pressStartedOnBackdrop = useRef(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pressStartedOnBackdrop.current && e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-busy={busy}
        aria-label={typeof title === 'string' ? title : undefined}
        className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-2xl border ${theme.cardBorder} max-h-[85vh] flex flex-col`}
        style={{ backgroundColor: theme.card }}
      >
        <div className="flex items-center justify-between gap-2 px-5 pt-5 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {headerStart}
            <h2 className={`font-bold text-lg truncate ${theme.textPrimary}`}>{title}</h2>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            disabled={busy}
            onClick={requestClose}
            className={`shrink-0 ${theme.textSecondary} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={`px-5 overflow-y-auto flex-1 min-h-0 ${footer ? 'pb-3' : 'pb-5'}`}>{children}</div>
        {footer && <div className={`px-5 py-4 border-t ${theme.border}`}>{footer}</div>}
      </div>
    </div>
  );
}
