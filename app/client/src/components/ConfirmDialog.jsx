import { useState } from 'react';
import Modal from './Modal';
import { useTheme } from '../theme';

export default function ConfirmDialog({ title, message, confirmLabel = 'حذف', onConfirm, onClose }) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={busy ? () => {} : onClose}>
      <div className={`text-sm leading-relaxed mb-5 ${theme.textSecondary}`}>{message}</div>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={confirm}
          disabled={busy}
          className="flex-1 rounded-xl py-2.5 font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {busy ? 'جاري الحذف...' : confirmLabel}
        </button>
        <button
          onClick={onClose}
          disabled={busy}
          className={`flex-1 rounded-xl py-2.5 font-bold text-sm border transition-colors ${theme.border} ${theme.textPrimary} ${theme.hover} disabled:opacity-60`}
        >
          إلغاء
        </button>
      </div>
    </Modal>
  );
}
