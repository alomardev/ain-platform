import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme';

export default function Splash() {
  const navigate = useNavigate();
  const { dark, setDark, theme } = useTheme();

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center relative transition-colors duration-300 px-6"
      style={{ backgroundColor: theme.bg }}
    >
      <button
        onClick={() => setDark((d) => !d)}
        className={`ain-accent-hover absolute top-6 left-6 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
          dark ? 'bg-[#171A21] border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
        }`}
      >
        {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        {dark ? 'الوضع النهاري' : 'الوضع الليلي'}
      </button>

      <div className="flex flex-col items-center text-center max-w-sm">
        <img
          src={dark ? '/logo/mark-gold.png' : '/logo/mark-teal.png'}
          alt="شعار عين"
          className="w-28 h-28 object-contain mb-5"
        />

        <h1 className={`text-3xl font-extrabold mb-1 ${theme.textPrimary}`}>
          <span className="ain-accent-text">عين</span> .. لخدمة المتطوعين
        </h1>
        <p className={`text-sm mb-10 ${theme.textSecondary}`}>وحدة التحكم بفريق العيون التطوعي</p>

        <button
          onClick={() => navigate('/dashboard')}
          className="ain-accent-solid flex items-center gap-2 rounded-2xl px-10 py-3.5 text-base font-bold transition-opacity hover:opacity-90 shadow-sm"
        >
          انطلق
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
