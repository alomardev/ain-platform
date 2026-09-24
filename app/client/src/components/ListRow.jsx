import { ChevronLeft } from 'lucide-react';
import { useTheme } from '../theme';

export default function ListRow({ leading, main, meta, trailing, onClick }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-3.5 px-1 border-b ${theme.border} ${theme.hover} transition-colors text-right`}
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
  );
}
