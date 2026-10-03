import { toAsciiDigits } from './volunteer.js';

// Shared by the UI (src/) and the API (functions/) so roles and hours are validated identically.

export const ROLE_VOLUNTEER = 'متطوع';
export const ROLE_SUPERVISOR = 'مشرف';
export const ROLE_DEPUTY = 'مساعد مشرف';
export const ROLE_OTHER = 'other';

export const ROLE_OPTIONS = [
  { key: ROLE_VOLUNTEER, label: 'متطوع' },
  { key: ROLE_SUPERVISOR, label: 'مشرف' },
  { key: ROLE_DEPUTY, label: 'مساعد مشرف' },
  { key: ROLE_OTHER, label: 'أخرى' },
];

export const MAX_HOURS = 10000;

// Supervisor/deputy flags drive the crown icon and ordering; they always follow the role.
export function roleFlags(role) {
  return { is_supervisor: role === ROLE_SUPERVISOR ? 1 : 0, is_deputy: role === ROLE_DEPUTY ? 1 : 0 };
}

// Form state { roleKey, customRole, hours } <-> stored { role, hours }.
export function participationToForm(p) {
  const known = [ROLE_VOLUNTEER, ROLE_SUPERVISOR, ROLE_DEPUTY].includes(p?.role);
  return {
    roleKey: !p?.role ? ROLE_VOLUNTEER : known ? p.role : ROLE_OTHER,
    customRole: p?.role && !known ? p.role : '',
    hours: p?.hours === undefined || p?.hours === null ? '' : String(p.hours),
  };
}

export function formToParticipation(f) {
  return { role: f.roleKey === ROLE_OTHER ? f.customRole.trim() : f.roleKey, hours: parseHours(f.hours) };
}

export function parseHours(value) {
  const text = toAsciiDigits(value).replace('٫', '.').trim();
  if (text === '') return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : NaN;
}

// Validates the stored shape { role, hours }; returns { field: message }.
export function validateParticipation({ role, hours }) {
  const errors = {};
  if (typeof role !== 'string' || !role.trim()) errors.role = 'الدور مطلوب';
  else if (role.trim().length > 50) errors.role = 'الدور طويل جداً (50 حرفاً كحد أقصى)';
  if (hours === null || hours === undefined || hours === '') errors.hours = 'عدد الساعات مطلوب';
  else if (typeof hours !== 'number' || !Number.isFinite(hours)) errors.hours = 'عدد الساعات يجب أن يكون رقماً';
  else if (hours < 0) errors.hours = 'عدد الساعات لا يمكن أن يكون سالباً';
  else if (hours > MAX_HOURS) errors.hours = 'عدد الساعات كبير جداً';
  return errors;
}

// Form-level validation (custom role text gets its own message).
export function validateParticipationForm(f) {
  const errors = validateParticipation(formToParticipation(f));
  if (errors.role && f.roleKey === ROLE_OTHER) {
    errors.customRole = f.customRole.trim() ? errors.role : 'اكتب اسم الدور';
    delete errors.role;
  }
  return errors;
}
