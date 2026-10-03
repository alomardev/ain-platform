import { NavLink } from 'react-router-dom';
import { Home, Users, ClipboardList, Handshake, Info, X } from 'lucide-react';
import { useTheme } from '../theme';
import AinMark from './AinMark';

const navItems = [
  { to: '/dashboard', label: 'الرئيسية', icon: Home },
  { to: '/volunteers', label: 'المتطوعون', icon: Users },
  { to: '/programs', label: 'البرامج', icon: ClipboardList },
  { to: '/sponsors', label: 'الرعاة', icon: Handshake },
];

export default function Sidebar({ open = false, onClose }) {
  const { theme } = useTheme();

  return (
    <>
      <div
        onClick={onClose}
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside
        className={`flex flex-col w-60 shrink-0 border-l ${theme.sidebarBorder} h-screen transition-[translate,visibility] duration-200
          max-md:fixed max-md:inset-y-0 max-md:right-0 max-md:z-50 md:sticky md:top-0
          ${open ? '' : 'max-md:translate-x-full max-md:invisible'}`}
        style={{ backgroundColor: theme.sidebarBg }}
      >
        <div className="flex items-center gap-2 px-5 py-6">
          <AinMark className="h-9 w-9" />
          <span className={`font-extrabold text-lg ain-accent-text`}>عين</span>
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className={`md:hidden mr-auto rounded-lg p-1.5 transition-colors ${theme.navInactive}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'ain-accent-bg-soft' : theme.navInactive
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/about"
          className={`mx-3 mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${theme.navInactive}`}
        >
          <Info className="h-4.5 w-4.5" />
          عن الفريق
        </NavLink>

        <div className={`px-4 py-4 border-t ${theme.border} flex items-center gap-3`}>
          <div className="h-9 w-9 rounded-full ain-accent-bg-soft flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${theme.textPrimary}`}>عبدالله فالح</p>
            <p className={`text-xs truncate ${theme.textSecondary}`}>مدير النظام</p>
          </div>
        </div>
      </aside>
    </>
  );
}
