import { X } from 'lucide-react';
import { useTheme } from '../theme';

export default function Modal({ title, onClose, children }) {
  const { theme } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border ${theme.cardBorder} p-5 max-h-[85vh] overflow-y-auto`}
        style={{ backgroundColor: theme.card }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-bold text-lg ${theme.textPrimary}`}>{title}</h2>
          <button onClick={onClose} className={theme.textSecondary}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
