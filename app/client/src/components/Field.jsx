import { useTheme } from '../theme';

// Pass as="div" when children hold several controls (a <label> would forward clicks to the first one).
export default function Field({ label, children, as: Tag = 'label', required, optional, error }) {
  const { theme } = useTheme();
  return (
    <Tag className="block mb-3">
      <span className={`block text-xs font-semibold mb-1.5 ${theme.textSecondary}`}>
        {label}
        {required && <span className="text-red-500 mr-0.5" aria-hidden="true">*</span>}
        {optional && <span className={`font-normal mr-1 ${theme.textMuted}`}>(اختياري)</span>}
      </span>
      {children}
      {error && <span role="alert" className="block text-xs text-red-500 mt-1">{error}</span>}
    </Tag>
  );
}

export function inputClass(theme, invalid = false) {
  return `w-full rounded-xl border ${invalid ? 'border-red-500' : theme.border} px-3 py-2 text-sm outline-none ain-accent-hover ${theme.textPrimary}`;
}
