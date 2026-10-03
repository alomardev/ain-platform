import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import ParticipationFields from './ParticipationFields';
import ConfirmDialog from './ConfirmDialog';
import { useTheme } from '../theme';
import { api } from '../api';
import { formToParticipation, participationToForm, validateParticipationForm } from '../../shared/participation.js';

// Edit a volunteer's role/hours in a program, or remove them from it.
// participation: { participation_id, role, hours }; volunteerName / programName label the dialog.
export default function ParticipationFormModal({ participation, volunteerName, programName, onClose, onSaved }) {
  const { theme } = useTheme();
  const [form, setForm] = useState(() => participationToForm(participation));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const found = validateParticipationForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError('');
    try {
      await api.updateParticipation(participation.participation_id, formToParticipation(form));
      onSaved();
    } catch (err) {
      setErrors(err.fields ?? {});
      setError(err.message);
      setSaving(false);
    }
  };

  if (confirmRemove) {
    return (
      <ConfirmDialog
        title="إزالة من البرنامج"
        confirmLabel="إزالة"
        message={
          <p>
            هل تريد إزالة <span className={`font-bold ${theme.textPrimary}`}>{volunteerName}</span> من برنامج{' '}
            <span className={`font-bold ${theme.textPrimary}`}>{programName}</span>؟ سيتم حذف ساعاته في هذا البرنامج.
          </p>
        }
        onClose={() => setConfirmRemove(false)}
        onConfirm={async () => {
          await api.deleteParticipation(participation.participation_id);
          onSaved();
        }}
      />
    );
  }

  return (
    <Modal
      title="تعديل المشاركة"
      onClose={onClose}
      busy={saving}
      footer={
        <div className="flex gap-2">
          <button form="participation-form" type="submit" disabled={saving}
            className="ain-accent-solid flex-1 rounded-xl py-2.5 font-bold text-sm disabled:opacity-60">
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" disabled={saving} onClick={() => setConfirmRemove(true)}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 font-bold text-sm border text-red-500 transition-colors disabled:opacity-60 ${theme.border} ${theme.hover}`}>
            <Trash2 className="h-4 w-4" /> إزالة من البرنامج
          </button>
        </div>
      }
    >
      <form id="participation-form" onSubmit={submit} noValidate>
        <div className={`rounded-xl border ${theme.border} p-3 mb-4`}>
          <p className={`text-sm font-bold ${theme.textPrimary}`}>{volunteerName}</p>
          <p className={`text-xs mt-0.5 ${theme.textSecondary}`}>{programName}</p>
        </div>
        <ParticipationFields value={form} onChange={(f) => { setForm(f); setErrors({}); }} errors={errors} />
        {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      </form>
    </Modal>
  );
}
