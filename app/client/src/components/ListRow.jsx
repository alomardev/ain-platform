import { ChevronLeft } from 'lucide-react';
import { useTheme } from '../theme';

// actions render beside (not inside) the row button, since buttons can't be nested.
export default function ListRow({ leading, main, meta, trailing, onClick, actions }) {
  const { theme } = useTheme();
  return (
    <div className={`flex items-center border-b ${theme.border}`}>
      <button
        onClick={onClick}
        className={`flex-1 min-w-0 flex items-center gap-3 py-3.5 px-1 ${theme.hover} transition-colors text-right`}
      >
        {leading}
        <div className="flex-1 truncate">
          <p className={`font-semibold truncate ${theme.textPrimary}`}>{main}</p>
          {meta && <p className={`text-xs truncate ${theme.textSecondary}`}>{meta}</p>}
        </div>
        <div className="shrink-0 flex items-center gap-3">
          {trailing}
          {onClick && <ChevronLeft className={`h-4 w-4 ${theme.textMuted}`} />}
        </div>
      </button>
      {actions && <div className="shrink-0 flex items-center pr-1">{actions}</div>}
    </div>
  );
}
