import Field, { inputClass } from './Field';
import { useTheme } from '../theme';
import { ROLE_OPTIONS, ROLE_OTHER } from '../../shared/participation.js';
import { toAsciiDigits } from '../../shared/volunteer.js';

// Role (متطوع / مشرف / مساعد مشرف / أخرى + custom text) and hours.
// value: { roleKey, customRole, hours } — see participationToForm / formToParticipation.
// compact: label-less single row, used per volunteer in the multi-add dialog.
export default function ParticipationFields({ value, onChange, errors = {}, compact = false }) {
  const { theme } = useTheme();
  const set = (patch) => onChange({ ...value, ...patch });
  const style = { backgroundColor: theme.inputBg };

  const roleSelect = (
    <select
      aria-label="الدور"
      className={inputClass(theme, errors.role)}
      style={style}
      value={value.roleKey}
      onChange={(e) => set({ roleKey: e.target.value })}
    >
      {ROLE_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
    </select>
  );
  const hoursInput = (
    <input
      aria-label="عدد الساعات"
      inputMode="decimal"
      dir="ltr"
      placeholder={compact ? 'الساعات' : '0'}
      className={`${inputClass(theme, errors.hours)} text-right`}
      style={style}
      value={value.hours}
      onChange={(e) => set({ hours: toAsciiDigits(e.target.value).replace('٫', '.').replace(/[^\d.]/g, '') })}
    />
  );
  const customInput = value.roleKey === ROLE_OTHER && (
    <input
      aria-label="اسم الدور"
      placeholder="اكتب اسم الدور، مثل: مصور"
      maxLength={50}
      className={inputClass(theme, errors.customRole)}
      style={style}
      value={value.customRole}
      onChange={(e) => set({ customRole: e.target.value })}
    />
  );

  if (compact) {
    const message = errors.customRole || errors.role || errors.hours;
    return (
      <div>
        <div className="grid grid-cols-[1fr_5.5rem] gap-2">
          {roleSelect}
          {hoursInput}
        </div>
        {customInput && <div className="mt-2">{customInput}</div>}
        {message && <p role="alert" className="text-xs text-red-500 mt-1">{message}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="الدور" required error={errors.role}>{roleSelect}</Field>
        <Field label="عدد الساعات" required error={errors.hours}>{hoursInput}</Field>
      </div>
      {customInput && <Field label="اسم الدور" required error={errors.customRole}>{customInput}</Field>}
    </>
  );
}
