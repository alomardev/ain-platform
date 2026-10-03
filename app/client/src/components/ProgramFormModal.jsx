import { useState } from 'react';
import Modal from './Modal';
import Field, { inputClass } from './Field';
import TagInput from './TagInput';
import { useTheme } from '../theme';
import { formatDate } from '../format';
import { api } from '../api';

const DEFAULTS = {
  name: '', description: '', category: 'internal', executor_name: '', location: '',
  supervisor_name: '', beneficiaries: 0,
};

export default function ProgramFormModal({ program, onClose, onSaved }) {
  const { theme } = useTheme();
  const isEdit = Boolean(program);
  // Form only edits single dates; range/multiple dates are kept as-is on edit.
  const editsDate = !isEdit || program.date_mode === 'single';
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, program?.[k] ?? DEFAULTS[k]])),
    date: program?.date_mode === 'single' ? program.dates[0] ?? '' : '',
    partners: program?.partners?.map((p) => p.name) ?? [],
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { date, ...rest } = form;
      const data = { ...rest, beneficiaries: Number(form.beneficiaries) || 0 };
      if (editsDate) Object.assign(data, { date_mode: 'single', dates: date ? [date] : [] });
      if (isEdit) await api.updateProgram(program.id, data);
      else await api.createProgram(data);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'تعديل برنامج' : 'إضافة برنامج'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="اسم البرنامج">
          <input required className={inputClass(theme)} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="الوصف">
          <textarea className={inputClass(theme)} rows={2} value={form.description} onChange={set('description')} />
        </Field>
        <Field label="التصنيف">
          <select className={inputClass(theme)} value={form.category} onChange={set('category')}>
            <option value="internal">داخلي</option>
            <option value="external">خارجي</option>
          </select>
        </Field>
        {form.category === 'external' && (
          <Field label="الجهة المنفذة">
            <input className={inputClass(theme)} value={form.executor_name} onChange={set('executor_name')} />
          </Field>
        )}
        <Field label="الموقع">
          <input className={inputClass(theme)} value={form.location} onChange={set('location')} />
        </Field>
        <Field label="المشرف">
          <input className={inputClass(theme)} value={form.supervisor_name} onChange={set('supervisor_name')} />
        </Field>
        <Field as="div" label="الجهات المشاركة">
          <TagInput
            value={form.partners}
            onChange={(partners) => setForm((f) => ({ ...f, partners }))}
            placeholder="اكتب اسم الجهة ثم اضغط Enter"
          />
        </Field>
        <Field label="عدد المستفيدين">
          <input type="number" className={inputClass(theme)} value={form.beneficiaries} onChange={set('beneficiaries')} />
        </Field>
        {editsDate ? (
          <Field label="تاريخ البرنامج">
            <input type="date" className={inputClass(theme)} value={form.date} onChange={set('date')} />
          </Field>
        ) : (
          <Field label="تواريخ البرنامج">
            <p className={`text-sm ${theme.textMuted}`}>{program.dates.map(formatDate).join(program.date_mode === 'range' ? ' — ' : '، ')}</p>
          </Field>
        )}
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <button disabled={saving} type="submit" className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm mt-2 disabled:opacity-60">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </Modal>
  );
}
