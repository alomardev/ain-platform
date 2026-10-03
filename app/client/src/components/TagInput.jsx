import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { inputClass } from './Field';
import { useTheme } from '../theme';

// Multi-value text entry: Enter / comma adds a chip, X removes it.
export default function TagInput({ value, onChange, placeholder }) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState('');

  const add = () => {
    const name = draft.trim();
    if (name && !value.includes(name)) onChange([...value, name]);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '،') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((name) => (
            <span
              key={name}
              className={`inline-flex items-center gap-1 text-xs font-medium ps-2.5 pe-1.5 py-1 rounded-full border ${theme.border} ${theme.textSecondary}`}
            >
              {name}
              <button
                type="button"
                aria-label={`إزالة ${name}`}
                onClick={(e) => {
                  e.preventDefault();
                  onChange(value.filter((n) => n !== name));
                }}
                className="hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className={inputClass(theme)}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
        />
        <button
          type="button"
          aria-label="إضافة"
          onClick={(e) => {
            e.preventDefault();
            add();
          }}
          className={`shrink-0 rounded-xl border px-3 ${theme.border} ${theme.textSecondary} ${theme.hover}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
