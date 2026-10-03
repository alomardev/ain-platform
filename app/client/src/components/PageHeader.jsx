import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../theme';
import { useSidebar } from './sidebarContext';

export default function PageHeader({ title, backTo, backLabel = 'رجوع', action }) {
  const navigate = useNavigate();
  const { dark, setDark, theme } = useTheme();
  const sidebar = useSidebar();

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        {sidebar && (
          <button
            onClick={() => sidebar.setSidebarOpen(true)}
            aria-label="فتح القائمة"
            aria-expanded={sidebar.sidebarOpen}
            className={`md:hidden ain-accent-hover shrink-0 rounded-full p-2 border transition-colors ${theme.border} ${theme.textSecondary}`}
          >
            <Menu className="h-3.5 w-3.5" />
          </button>
        )}
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className={`ain-accent-hover flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${theme.border} ${theme.textSecondary}`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            {backLabel}
          </button>
        )}
        {title && <h1 className={`text-2xl font-extrabold truncate ${theme.textPrimary}`}>{title}</h1>}
      </div>

      <div className="ain-header-actions flex items-center gap-2 shrink-0">
        {action}
        <button
          onClick={() => setDark((d) => !d)}
          className={`ain-accent-hover flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
            dark ? 'bg-[#171A21] border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
          }`}
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          <span className="ain-btn-label">{dark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
        </button>
      </div>
    </div>
  );
}
