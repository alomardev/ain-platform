import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Search, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import PillTabs from '../components/PillTabs';
import ListRow from '../components/ListRow';
import GenderIcon from '../components/GenderIcon';
import VolunteerFormModal from '../components/VolunteerFormModal';
import { useTheme } from '../theme';
import { formatNumber } from '../format';
import { api } from '../api';

const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'm', label: 'المتطوعون' },
  { key: 'f', label: 'المتطوعات' },
];

export default function Volunteers() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [volunteers, setVolunteers] = useState([]);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.volunteers().then(setVolunteers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const byTab = useMemo(
    () => (tab === 'all' ? volunteers : volunteers.filter((v) => v.gender === tab)),
    [volunteers, tab]
  );
  const filtered = useMemo(
    () => byTab.filter((v) => v.name.toLowerCase().includes(query.toLowerCase())),
    [byTab, query]
  );
  const totalHours = useMemo(() => byTab.reduce((s, v) => s + v.total_hours, 0), [byTab]);

  return (
    <Layout>
      <PageHeader
        title="المتطوعون"
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="ain-accent-solid flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة متطوع
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={Users} label="المتطوعين" value={formatNumber(byTab.length)} />
        <StatCard icon={Clock} label="الساعات" value={formatNumber(totalHours)} suffix="ساعة" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <PillTabs items={TABS} value={tab} onChange={setTab} />
        <div className="relative flex-1 sm:max-w-xs sm:mr-auto">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${theme.textMuted}`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالاسم..."
            className={`w-full rounded-xl border ${theme.border} pr-9 pl-3 py-2 text-sm outline-none ain-accent-hover ${theme.textPrimary}`}
            style={{ backgroundColor: theme.inputBg }}
          />
        </div>
      </div>

      {loading && <p className={`text-sm ${theme.textSecondary}`}>جاري التحميل...</p>}

      <div>
        {filtered.map((v) => (
          <ListRow
            key={v.id}
            onClick={() => navigate(`/volunteers/${v.id}`)}
            leading={
              <div className="h-10 w-10 rounded-full ain-accent-bg-soft flex items-center justify-center shrink-0">
                <GenderIcon gender={v.gender} />
              </div>
            }
            main={v.name}
            meta={`${v.total_programs} برنامج`}
            trailing={
              <span className={`text-xs font-semibold ${theme.textSecondary}`}>{formatNumber(v.total_hours)} س</span>
            }
          />
        ))}
        {!loading && filtered.length === 0 && (
          <p className={`text-sm py-8 text-center ${theme.textSecondary}`}>لا يوجد متطوعون مطابقون</p>
        )}
      </div>

      {showAdd && (
        <VolunteerFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </Layout>
  );
}
