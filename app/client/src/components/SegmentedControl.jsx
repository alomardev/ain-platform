import { useTheme } from '../theme';

// Button group backed by real radio inputs (keyboard + form semantics), styled like PillTabs.
export default function SegmentedControl({ name, items, value, onChange }) {
  const { theme } = useTheme();
  return (
    <div role="radiogroup" className="flex gap-2 mb-3">
      {items.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <label
            key={key}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold border cursor-pointer transition-colors has-[:focus-visible]:ring-2 ${
              active ? 'ain-pill-active border-transparent' : `${theme.border} ${theme.textSecondary} ${theme.hover}`
            }`}
          >
            <input
              type="radio"
              name={name}
              value={key}
              checked={active}
              onChange={() => onChange(key)}
              className="sr-only"
            />
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </label>
        );
      })}
    </div>
  );
}
