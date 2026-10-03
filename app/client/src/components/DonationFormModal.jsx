import { useEffect, useState } from 'react';
import { Wallet, Package, Landmark, HeartHandshake } from 'lucide-react';
import Modal from './Modal';
import Field, { inputClass } from './Field';
import SegmentedControl from './SegmentedControl';
import RiyalSymbol from './RiyalSymbol';
import { useTheme } from '../theme';
import { api } from '../api';

const today = () => new Date().toISOString().slice(0, 10);

export default function DonationFormModal({ sponsorId, donation, onClose, onSaved }) {
  const { theme } = useTheme();
  const isEdit = Boolean(donation);
  const [form, setForm] = useState(() => ({
    target: donation?.program_id ? 'program' : 'fund',
    program_id: donation?.program_id ? String(donation.program_id) : '',
    support_type: donation?.support_type ?? 'cash',
    inkind_item: donation?.inkind_item ?? '',
    amount: donation?.amount ?? '',
    date: donation?.date ?? today(),
  }));
  const [programs, setPrograms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const choose = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const isInkind = form.support_type === 'inkind';

  useEffect(() => {
    api.programs().then(setPrograms).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        program_id: form.target === 'program' ? Number(form.program_id) : null,
        support_type: form.support_type,
        inkind_item: isInkind ? form.inkind_item.trim() : null,
        amount: Number(form.amount) || 0,
        date: form.date,
      };
      if (isEdit) await api.updateDonation(donation.id, data);
      else await api.createDonation({ ...data, sponsor_id: sponsorId });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError('');
    try {
      await api.deleteDonation(donation.id);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'تعديل دعم' : 'إضافة دعم'} onClose={saving ? () => {} : onClose}>
      <form onSubmit={submit}>
        <SegmentedControl
          name="target"
          items={[
            { key: 'fund', label: 'للصندوق', icon: Landmark },
            { key: 'program', label: 'لبرنامج محدد', icon: HeartHandshake },
          ]}
          value={form.target}
          onChange={choose('target')}
        />
        {form.target === 'program' && (
          <Field label="البرنامج">
            <select required className={inputClass(theme)} value={form.program_id} onChange={set('program_id')}>
              <option value="" disabled>اختر البرنامج</option>
              {programs.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>
          </Field>
        )}

        <SegmentedControl
          name="support_type"
          items={[
            { key: 'cash', label: 'مالي', icon: Wallet },
            { key: 'inkind', label: 'عيني', icon: Package },
          ]}
          value={form.support_type}
          onChange={choose('support_type')}
        />
        {isInkind && (
          <Field label="ماهية الدعم العيني">
            <input required className={inputClass(theme)} value={form.inkind_item} onChange={set('inkind_item')} />
          </Field>
        )}

        <Field label={isInkind ? 'المبلغ (التقريبي)' : 'المبلغ'}>
          <div className="relative">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              className={`${inputClass(theme)} pl-9 text-right`}
              value={form.amount}
              onChange={set('amount')}
            />
            <RiyalSymbol className={`h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${theme.textMuted}`} />
          </div>
        </Field>

        <Field label="تاريخ الدعم">
          <input required type="date" className={inputClass(theme)} value={form.date} onChange={set('date')} />
        </Field>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {confirmDelete ? (
          <div className="mt-2">
            <p className={`text-sm mb-3 ${theme.textSecondary}`}>هل أنت متأكد من حذف هذا الدعم؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={remove}
                disabled={saving}
                className="flex-1 rounded-xl py-2.5 font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'جاري الحذف...' : 'حذف'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={saving}
                className={`flex-1 rounded-xl py-2.5 font-bold text-sm border transition-colors ${theme.border} ${theme.textPrimary} ${theme.hover} disabled:opacity-60`}
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-2">
            <button disabled={saving} type="submit" className="ain-accent-solid flex-1 rounded-xl py-2.5 font-bold text-sm disabled:opacity-60">
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="rounded-xl px-4 py-2.5 font-bold text-sm border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-60"
              >
                حذف
              </button>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
