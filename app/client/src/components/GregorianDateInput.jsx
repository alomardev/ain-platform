import { useState } from 'react';
import { X } from 'lucide-react';
import { inputClass } from './Field';
import { useTheme } from '../theme';
import { INCOMPLETE_DATE } from '../../shared/volunteer.js';

// Gregorian month names. Native <input type="date"> may render the device calendar (e.g. Hijri on iOS),
// so dates are picked with three selects that are always Gregorian.
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function daysInMonth(year, month) {
  if (!month) return 31;
  return new Date(Date.UTC(year || 2000, month, 0)).getUTCDate(); // 2000 is a leap year, so Feb allows 29
}

function partsFromIso(iso) {
  const [y, m, d] = (iso || '').split('-').map(Number);
  return y && m && d ? { y, m, d } : { y: '', m: '', d: '' };
}

const pad = (n) => String(n).padStart(2, '0');

// value/onChange use ISO "YYYY-MM-DD"; onChange receives '' when empty and INCOMPLETE_DATE when partly picked.
export default function GregorianDateInput({ value, onChange, minYear, maxYear, required, clearable, invalid }) {
  const { theme } = useTheme();
  const [parts, setParts] = useState(() => partsFromIso(value));

  const update = (patch) => {
    const next = { ...parts, ...patch };
    if (next.d && next.d > daysInMonth(next.y, next.m)) next.d = daysInMonth(next.y, next.m);
    setParts(next);
    if (next.y && next.m && next.d) onChange(`${next.y}-${pad(next.m)}-${pad(next.d)}`);
    else onChange(next.y || next.m || next.d ? INCOMPLETE_DATE : '');
  };

  const years = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);
  const days = Array.from({ length: daysInMonth(parts.y, parts.m) }, (_, i) => i + 1);
  const selectClass = `${inputClass(theme, invalid)} px-2`;
  const style = { backgroundColor: theme.inputBg };
  const hasValue = parts.y || parts.m || parts.d;

  return (
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-[1fr_1.6fr_1.3fr] gap-2 flex-1">
        <select aria-label="اليوم" required={required} className={selectClass} style={style}
          value={parts.d} onChange={(e) => update({ d: Number(e.target.value) || '' })}>
          <option value="" disabled>اليوم</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select aria-label="الشهر" required={required} className={selectClass} style={style}
          value={parts.m} onChange={(e) => update({ m: Number(e.target.value) || '' })}>
          <option value="" disabled>الشهر</option>
          {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
        </select>
        <select aria-label="السنة" required={required} className={selectClass} style={style}
          value={parts.y} onChange={(e) => update({ y: Number(e.target.value) || '' })}>
          <option value="" disabled>السنة</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {clearable && hasValue && (
        <button type="button" aria-label="مسح التاريخ" onClick={() => update({ y: '', m: '', d: '' })}
          className={`shrink-0 rounded-full p-1.5 transition-colors ${theme.textSecondary} ${theme.hover}`}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
