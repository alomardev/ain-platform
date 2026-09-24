import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme';

export default function PageHeader({ title, backTo, backLabel = 'رجوع', action }) {
  const navigate = useNavigate();
  const { dark, setDark, theme } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className={`ain-accent-hover flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${theme.border} ${theme.textSecondary}`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            {backLabel}
          </button>
        )}
        {title && <h1 className={`text-2xl font-extrabold ${theme.textPrimary}`}>{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {action}
        <button
          onClick={() => setDark((d) => !d)}
          className={`ain-accent-hover flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
            dark ? 'bg-[#171A21] border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
          }`}
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {dark ? 'الوضع النهاري' : 'الوضع الليلي'}
        </button>
      </div>
    </div>
  );
}
