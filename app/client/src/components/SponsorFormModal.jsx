import { useState } from 'react';
import Modal from './Modal';
import Field, { inputClass } from './Field';
import { useTheme } from '../theme';
import { api } from '../api';

const FIELDS = ['name', 'category', 'phone', 'email'];

export default function SponsorFormModal({ sponsor, onClose, onSaved }) {
  const { theme } = useTheme();
  const isEdit = Boolean(sponsor);
  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELDS.map((k) => [k, sponsor?.[k] ?? (k === 'category' ? 'company' : '')]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit) await api.updateSponsor(sponsor.id, form);
      else await api.createSponsor({ ...form, since: new Date().toISOString().slice(0, 10) });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'تعديل راعٍ' : 'إضافة راعٍ'} onClose={onClose} busy={saving}>
      <form onSubmit={submit}>
        <Field label="الاسم">
          <input required className={inputClass(theme)} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="التصنيف">
          <select className={inputClass(theme)} value={form.category} onChange={set('category')}>
            <option value="company">شركة</option>
            <option value="person">شخص</option>
          </select>
        </Field>
        <Field label="رقم الجوال">
          <input className={inputClass(theme)} value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="البريد الإلكتروني">
          <input type="email" className={inputClass(theme)} value={form.email} onChange={set('email')} />
        </Field>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <button disabled={saving} type="submit" className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm mt-2 disabled:opacity-60">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </Modal>
  );
}
