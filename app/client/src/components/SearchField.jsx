import { Search, X } from 'lucide-react';
import { useTheme } from '../theme';

export default function SearchField({ value, onChange, placeholder, autoFocus }) {
  const { theme } = useTheme();
  return (
    <div className="relative">
      <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${theme.textMuted}`} />
      <input
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-xl border ${theme.border} pr-9 pl-9 py-2 text-sm outline-none ain-accent-hover ${theme.textPrimary} [&::-webkit-search-cancel-button]:hidden`}
        style={{ backgroundColor: theme.inputBg }}
      />
      {value && (
        <button type="button" aria-label="مسح البحث" onClick={() => onChange('')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 ${theme.textMuted} ${theme.hover}`}>
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
