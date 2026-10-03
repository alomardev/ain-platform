import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { SidebarContext } from './sidebarContext';
import { useTheme } from '../theme';

export default function Layout({ children }) {
  const { theme } = useTheme();
  // Each page renders its own Layout, so navigating remounts it and closes the mobile drawer.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div dir="rtl" className={`min-h-screen flex ${theme.textPrimary}`} style={{ backgroundColor: theme.bg }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
}
