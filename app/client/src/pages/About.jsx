import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sun, Moon, MapPin, AtSign, MessageCircle, Mail, Phone } from 'lucide-react';
import { useTheme } from '../theme';

export default function About() {
  const navigate = useNavigate();
  const { dark, setDark, theme } = useTheme();

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className={`ain-accent-hover flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${theme.border} ${theme.textSecondary}`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            الرئيسية
          </button>
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

        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <img src="/logo/team-logo.png" alt="شعار فريق العيون التطوعي" className="h-20 object-contain" />
          </div>
          <h1 className={`text-2xl font-extrabold ${theme.textPrimary}`}>فريق العيون التطوعي</h1>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border ${theme.cardBorder} p-5`} style={{ backgroundColor: theme.card }}>
            <h2 className={`font-bold mb-2 ain-accent-text`}>من نحن</h2>
            <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>
              فريق تطوعي يعمل على تنظيم وتنفيذ المبادرات الإنسانية والاجتماعية، بإشراف جمعية العيون التطوعية.
            </p>
          </div>
          <div className={`rounded-2xl border ${theme.cardBorder} p-5`} style={{ backgroundColor: theme.card }}>
            <h2 className={`font-bold mb-2 ain-accent-text`}>الجهة المنفذة</h2>
            <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>جمعية العيون التطوعية</p>
          </div>
          <div className={`rounded-2xl border ${theme.cardBorder} p-5`} style={{ backgroundColor: theme.card }}>
            <h2 className={`font-bold mb-2 ain-accent-text`}>عن منصة عين</h2>
            <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>
              منصة عين هي وحدة التحكم الداخلية لفريق العيون التطوعي، تتيح إدارة المتطوعين والبرامج والرعاة في مكان واحد.
            </p>
          </div>
        </div>

        <footer className={`mt-10 pt-6 border-t ${theme.border} text-center space-y-2`}>
          <p className={`text-xs flex items-center justify-center gap-1.5 ${theme.textMuted}`}>
            <MapPin className="h-3.5 w-3.5" /> FODB 6682
          </p>
          <p className={`text-xs flex items-center justify-center gap-1.5 ${theme.textMuted}`}>
            <AtSign className="h-3.5 w-3.5" /> aloyunv
          </p>
          <p className={`text-xs flex items-center justify-center gap-1.5 ${theme.textMuted}`}>
            <MessageCircle className="h-3.5 w-3.5" /> +966541822889
          </p>
          <p className={`text-xs flex items-center justify-center gap-1.5 ${theme.textMuted}`}>
            <Mail className="h-3.5 w-3.5" /> aluyonv@gmail.com
          </p>
          <p className={`text-xs flex items-center justify-center gap-1.5 ${theme.textMuted}`}>
            <Phone className="h-3.5 w-3.5" /> 0541822889
          </p>
          <p className={`text-xs ${theme.textMuted} pt-2`}>© {new Date().getFullYear()} جمعية العيون التطوعية</p>
        </footer>
      </div>
    </div>
  );
}
