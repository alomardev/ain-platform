import { useTheme } from '../theme';

// Pass as="div" when children hold several controls (a <label> would forward clicks to the first one).
export default function Field({ label, children, as: Tag = 'label' }) {
  const { theme } = useTheme();
  return (
    <Tag className="block mb-3">
      <span className={`block text-xs font-semibold mb-1.5 ${theme.textSecondary}`}>{label}</span>
      {children}
    </Tag>
  );
}

export function inputClass(theme) {
  return `w-full rounded-xl border ${theme.border} px-3 py-2 text-sm outline-none ain-accent-hover ${theme.textPrimary}`;
}
