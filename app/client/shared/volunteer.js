// Shared by the form (src/) and the API (functions/) so both validate identically.

// Arabic-Indic (٠-٩) and Persian (۰-۹) digits → ASCII, so "١٠٢٣..." typed on an Arabic keyboard still works.
export function toAsciiDigits(value) {
  return String(value ?? '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

export function normalizeNationalId(value) {
  return toAsciiDigits(value).replace(/\D/g, '');
}

export function isValidNationalId(value) {
  return /^\d{10}$/.test(value ?? '');
}

// Strict YYYY-MM-DD that is a real Gregorian date (rejects 2025-02-30).
export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

// Emitted by the date picker when only some of day/month/year are chosen.
export const INCOMPLETE_DATE = 'incomplete';
const INCOMPLETE_MESSAGE = 'أكمل اختيار اليوم والشهر والسنة';

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Returns { field: message } for every invalid field; empty object when valid.
export function validateVolunteer(v) {
  const errors = {};
  if (!v.name?.trim()) errors.name = 'الاسم مطلوب';
  if (!['m', 'f'].includes(v.gender)) errors.gender = 'الجنس مطلوب';
  if (!v.national_id) errors.national_id = 'رقم الهوية الوطنية مطلوب';
  else if (!isValidNationalId(v.national_id)) errors.national_id = 'رقم الهوية الوطنية يجب أن يتكون من 10 أرقام';
  if (!v.birth_date) errors.birth_date = 'تاريخ الميلاد مطلوب';
  else if (v.birth_date === INCOMPLETE_DATE) errors.birth_date = INCOMPLETE_MESSAGE;
  else if (!isValidIsoDate(v.birth_date)) errors.birth_date = 'تاريخ الميلاد غير صحيح';
  else if (v.birth_date > todayIso()) errors.birth_date = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
  if (v.join_date === INCOMPLETE_DATE) errors.join_date = INCOMPLETE_MESSAGE;
  else if (v.join_date && !isValidIsoDate(v.join_date)) errors.join_date = 'تاريخ الانضمام غير صحيح';
  return errors;
}
