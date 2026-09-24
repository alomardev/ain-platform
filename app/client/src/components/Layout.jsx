import Sidebar from './Sidebar';
import { useTheme } from '../theme';

export default function Layout({ children }) {
  const { theme } = useTheme();
  return (
    <div dir="rtl" className="min-h-screen flex" style={{ backgroundColor: theme.bg }}>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
