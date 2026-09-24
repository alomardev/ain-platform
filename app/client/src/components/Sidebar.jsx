import { NavLink } from 'react-router-dom';
import { Home, Users, ClipboardList, Handshake, Info } from 'lucide-react';
import { useTheme } from '../theme';

const navItems = [
  { to: '/dashboard', label: 'الرئيسية', icon: Home },
  { to: '/volunteers', label: 'المتطوعون', icon: Users },
  { to: '/programs', label: 'البرامج', icon: ClipboardList },
  { to: '/sponsors', label: 'الرعاة', icon: Handshake },
];

export default function Sidebar() {
  const { dark, theme } = useTheme();

  return (
    <aside
      className={`hidden md:flex flex-col w-60 shrink-0 border-l ${theme.sidebarBorder} h-screen sticky top-0`}
      style={{ backgroundColor: theme.sidebarBg }}
    >
      <div className="flex items-center gap-2 px-5 py-6">
        <img src={dark ? '/logo/mark-gold.png' : '/logo/mark-teal.png'} alt="عين" className="h-9 w-9 object-contain" />
        <span className={`font-extrabold text-lg ain-accent-text`}>عين</span>
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
  );
}
