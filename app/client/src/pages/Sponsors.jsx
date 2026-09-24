import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, ClipboardCheck, Plus, Search, Building2 } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ListRow from '../components/ListRow';
import GenderIcon from '../components/GenderIcon';
import SponsorFormModal from '../components/SponsorFormModal';
import { useTheme } from '../theme';
import { formatNumber } from '../format';
import { api } from '../api';

export default function Sponsors() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sponsors, setSponsors] = useState([]);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.sponsors().then(setSponsors).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(
    () => sponsors.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [sponsors, query]
  );
  const totalPrograms = useMemo(() => sponsors.reduce((s, sp) => s + sp.program_count, 0), [sponsors]);

  return (
    <Layout>
      <PageHeader
        title="الرعاة"
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="ain-accent-solid flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة راعٍ
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={Handshake} label="الرعاة" value={formatNumber(sponsors.length)} />
        <StatCard icon={ClipboardCheck} label="برامج مدعومة" value={formatNumber(totalPrograms)} />
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${theme.textMuted}`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث بالاسم..."
          className={`w-full rounded-xl border ${theme.border} pr-9 pl-3 py-2 text-sm outline-none ain-accent-hover ${theme.textPrimary}`}
          style={{ backgroundColor: theme.inputBg }}
        />
      </div>

      {loading && <p className={`text-sm ${theme.textSecondary}`}>جاري التحميل...</p>}

      <div>
        {filtered.map((s) => (
          <ListRow
            key={s.id}
            onClick={() => navigate(`/sponsors/${s.id}`)}
            leading={
              <div className="h-10 w-10 rounded-full ain-accent-bg-soft flex items-center justify-center shrink-0">
                {s.category === 'company' ? <Building2 className="h-5 w-5" /> : <GenderIcon gender="m" />}
              </div>
            }
            main={s.name}
            meta={`${s.category === 'company' ? 'شركة' : 'شخص'} · متعاون منذ ${(s.since || '').slice(0, 4)}`}
            trailing={<span className={`text-xs font-semibold ${theme.textSecondary}`}>{s.donation_count} دعمة</span>}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <p className={`text-sm py-8 text-center ${theme.textSecondary}`}>لا يوجد رعاة مطابقون</p>
        )}
      </div>

      {showAdd && (
        <SponsorFormModal
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
