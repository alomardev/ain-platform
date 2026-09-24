import { useTheme } from '../theme';

export default function Field({ label, children }) {
  const { theme } = useTheme();
  return (
    <label className="block mb-3">
      <span className={`block text-xs font-semibold mb-1.5 ${theme.textSecondary}`}>{label}</span>
      {children}
    </label>
  );
}

export function inputClass(theme) {
  return `w-full rounded-xl border ${theme.border} px-3 py-2 text-sm outline-none ain-accent-hover ${theme.textPrimary}`;
}
