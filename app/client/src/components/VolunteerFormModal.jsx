import { useState } from 'react';
import Modal from './Modal';
import Field, { inputClass } from './Field';
import { useTheme } from '../theme';
import { api } from '../api';

const FIELDS = ['name', 'gender', 'phone', 'email', 'qualification', 'job'];

export default function VolunteerFormModal({ volunteer, onClose, onSaved }) {
  const { theme } = useTheme();
  const isEdit = Boolean(volunteer);
  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELDS.map((k) => [k, volunteer?.[k] ?? (k === 'gender' ? 'm' : '')]))
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
      if (isEdit) await api.updateVolunteer(volunteer.id, form);
      else await api.createVolunteer({ ...form, join_date: new Date().toISOString().slice(0, 10) });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'تعديل متطوع' : 'إضافة متطوع'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="الاسم">
          <input required className={inputClass(theme)} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="الجنس">
          <select className={inputClass(theme)} value={form.gender} onChange={set('gender')}>
            <option value="m">ذكر</option>
            <option value="f">أنثى</option>
          </select>
        </Field>
        <Field label="رقم الجوال">
          <input className={inputClass(theme)} value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="البريد الإلكتروني">
          <input type="email" className={inputClass(theme)} value={form.email} onChange={set('email')} />
        </Field>
        <Field label="المؤهل العلمي">
          <input className={inputClass(theme)} value={form.qualification} onChange={set('qualification')} />
        </Field>
        <Field label="الوظيفة">
          <input className={inputClass(theme)} value={form.job} onChange={set('job')} />
        </Field>
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <button disabled={saving} type="submit" className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm mt-2 disabled:opacity-60">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </Modal>
  );
}
