import { useTheme } from '../theme';

export default function PillTabs({ items, value, onChange }) {
  const { theme } = useTheme();
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors ${theme.border} ${
            value === item.key ? 'ain-pill-active border-transparent' : `${theme.textSecondary} ${theme.hover}`
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
