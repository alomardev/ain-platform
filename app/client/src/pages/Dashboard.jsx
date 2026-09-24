import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Handshake, Clock, HandHeart, ChevronLeft } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useTheme } from '../theme';
import { formatNumber } from '../format';
import { api } from '../api';

function ManageCard({ icon: Icon, title, desc, onClick }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`ain-accent-hover text-right rounded-2xl border ${theme.cardBorder} p-5 transition-colors flex flex-col gap-3`}
      style={{ backgroundColor: theme.card }}
    >
      <div className="h-11 w-11 rounded-xl ain-accent-bg-soft flex items-center justify-center">
        <Icon className="h-5.5 w-5.5" />
      </div>
      <div>
        <p className={`font-bold ${theme.textPrimary}`}>{title}</p>
        <p className={`text-xs mt-0.5 ${theme.textSecondary}`}>{desc}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ain-accent-text mt-1`}>
        فتح <ChevronLeft className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {});
  }, []);

  return (
    <Layout>
      <PageHeader title="الرئيسية" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Users} label="المتطوعين" value={stats ? formatNumber(stats.volunteers) : '—'} />
        <StatCard icon={ClipboardList} label="البرامج" value={stats ? formatNumber(stats.programs) : '—'} />
        <StatCard icon={Clock} label="الساعات" value={stats ? formatNumber(stats.hours) : '—'} suffix="ساعة" />
        <StatCard icon={HandHeart} label="المستفيدين" value={stats ? formatNumber(stats.beneficiaries) : '—'} />
      </div>

      <h2 className="text-sm font-bold mb-3 opacity-70">ماذا تريد أن تدير؟</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ManageCard icon={Users} title="المتطوعون" desc="إدارة قائمة المتطوعين وسجل مشاركاتهم" onClick={() => navigate('/volunteers')} />
        <ManageCard icon={ClipboardList} title="البرامج" desc="إدارة البرامج والمبادرات التطوعية" onClick={() => navigate('/programs')} />
        <ManageCard icon={Handshake} title="الرعاة" desc="إدارة الرعاة وسجل الدعم" onClick={() => navigate('/sponsors')} />
      </div>
    </Layout>
  );
}
