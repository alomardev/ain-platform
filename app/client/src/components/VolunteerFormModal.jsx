import { useState } from 'react';
import Modal from './Modal';
import Field, { inputClass } from './Field';
import GregorianDateInput from './GregorianDateInput';
import AvatarUpload from './AvatarUpload';
import { useTheme } from '../theme';
import { api } from '../api';
import { normalizeNationalId, todayIso, validateVolunteer } from '../../shared/volunteer.js';

const FIELDS = ['name', 'national_id', 'gender', 'birth_date', 'phone', 'email', 'qualification', 'job', 'join_date'];
const CURRENT_YEAR = new Date().getFullYear();

export default function VolunteerFormModal({ volunteer, onClose, onSaved }) {
  const { theme } = useTheme();
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(FIELDS.map((k) => [k, volunteer?.[k] ?? ''])),
    gender: volunteer?.gender ?? 'm',
    join_date: volunteer ? volunteer.join_date ?? '' : todayIso(),
  }));
  const [photo, setPhoto] = useState({ blob: null, preview: null, removed: false });
  const [photoBusy, setPhotoBusy] = useState(false);
  // Set once a new volunteer is created, so a retry after a failed photo upload updates instead of duplicating.
  const [savedId, setSavedId] = useState(volunteer?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const setValue = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const set = (k) => (e) => setValue(k, e.target.value);

  const submit = async (e) => {
    e.preventDefault();
    const found = validateVolunteer(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setError('');
    let id = savedId;
    try {
      if (id) await api.updateVolunteer(id, form);
      else {
        ({ id } = await api.createVolunteer(form));
        setSavedId(id);
      }
    } catch (err) {
      setErrors(err.fields ?? {});
      setError(err.message);
      setSaving(false);
      return;
    }

    try {
      if (photo.blob) await api.uploadVolunteerPhoto(id, photo.blob);
      else if (photo.removed) await api.deleteVolunteerPhoto(id);
      onSaved();
    } catch (err) {
      setError(`تم حفظ البيانات، لكن تعذر تحديث الصورة: ${err.message}`);
      setSaving(false);
    }
  };

  // Once a new volunteer exists, closing must still refresh the list.
  const close = savedId && !volunteer ? onSaved : onClose;

  return (
    <Modal title={volunteer ? 'تعديل متطوع' : 'إضافة متطوع'} onClose={close} busy={saving}>
      <form onSubmit={submit} noValidate>
        <AvatarUpload
          currentPhoto={volunteer?.photo}
          gender={form.gender}
          value={photo}
          onChange={setPhoto}
          onBusyChange={setPhotoBusy}
        />
        <Field label="الاسم" required error={errors.name}>
          <input className={inputClass(theme, errors.name)} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="رقم الهوية الوطنية" required error={errors.national_id}>
          <input
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            maxLength={10}
            placeholder="1012345678"
            className={`${inputClass(theme, errors.national_id)} text-right`}
            value={form.national_id}
            onChange={(e) => setValue('national_id', normalizeNationalId(e.target.value).slice(0, 10))}
          />
        </Field>
        <Field label="الجنس" required error={errors.gender}>
          <select className={inputClass(theme)} value={form.gender} onChange={set('gender')}>
            <option value="m">ذكر</option>
            <option value="f">أنثى</option>
          </select>
        </Field>
        <Field as="div" label="تاريخ الميلاد (ميلادي)" required error={errors.birth_date}>
          <GregorianDateInput
            value={form.birth_date}
            onChange={(v) => setValue('birth_date', v)}
            minYear={CURRENT_YEAR - 100}
            maxYear={CURRENT_YEAR}
            invalid={Boolean(errors.birth_date)}
          />
        </Field>
        <Field label="رقم الجوال" optional>
          <input inputMode="tel" dir="ltr" className={`${inputClass(theme)} text-right`} value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="البريد الإلكتروني" optional>
          <input type="email" dir="ltr" className={`${inputClass(theme)} text-right`} value={form.email} onChange={set('email')} />
        </Field>
        <Field label="المؤهل العلمي" optional>
          <input className={inputClass(theme)} value={form.qualification} onChange={set('qualification')} />
        </Field>
        <Field label="الوظيفة" optional>
          <input className={inputClass(theme)} value={form.job} onChange={set('job')} />
        </Field>
        <Field as="div" label="تاريخ الانضمام" optional error={errors.join_date}>
          <GregorianDateInput
            value={form.join_date}
            onChange={(v) => setValue('join_date', v)}
            minYear={1990}
            maxYear={CURRENT_YEAR + 1}
            clearable
            invalid={Boolean(errors.join_date)}
          />
        </Field>
        {error && <p role="alert" className="text-xs text-red-500 mb-2">{error}</p>}
        <button
          disabled={saving || photoBusy}
          type="submit"
          className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm mt-2 disabled:opacity-60"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </Modal>
  );
}
