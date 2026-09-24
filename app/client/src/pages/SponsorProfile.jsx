import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Handshake, Building2, Wallet, Landmark, HeartHandshake, Package } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import PillTabs from '../components/PillTabs';
import GenderIcon from '../components/GenderIcon';
import RiyalSymbol from '../components/RiyalSymbol';
import EditDeleteActions from '../components/EditDeleteActions';
import SponsorFormModal from '../components/SponsorFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../theme';
import { formatDate, formatNumber, yearOf } from '../format';
import { api } from '../api';

export default function SponsorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sponsor, setSponsor] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const load = () => {
    api.sponsor(id).then(setSponsor).catch(() => {});
  };
  useEffect(load, [id]);

  const years = useMemo(() => {
    if (!sponsor) return [];
    return [...new Set(sponsor.donations.map((d) => yearOf(d.date)))].filter(Boolean).sort().reverse();
  }, [sponsor]);

  const filteredDonations = useMemo(() => {
    if (!sponsor) return [];
    const list = yearFilter === 'all' ? sponsor.donations : sponsor.donations.filter((d) => yearOf(d.date) === yearFilter);
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [sponsor, yearFilter]);

  const totalAmount = useMemo(() => filteredDonations.reduce((s, d) => s + d.amount, 0), [filteredDonations]);

  if (!sponsor) {
    return (
      <Layout>
        <p className={`text-sm ${theme.textSecondary}`}>جاري التحميل...</p>
      </Layout>
    );
  }

  const yearTabs = [{ key: 'all', label: 'الكل' }, ...years.map((y) => ({ key: y, label: y }))];

  return (
    <Layout>
      <PageHeader
        backTo="/sponsors"
        backLabel="الرعاة"
        action={<EditDeleteActions onEdit={() => setShowEdit(true)} onDelete={() => setShowDelete(true)} />}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="h-20 w-20 rounded-full ain-accent-bg-soft flex items-center justify-center shrink-0">
          {sponsor.category === 'company' ? <Building2 className="h-9 w-9" /> : <GenderIcon gender="m" className="h-9 w-9" />}
        </div>
        <div>
          <h1 className={`text-xl font-extrabold ain-accent-text`}>{sponsor.name}</h1>
          <p className={`text-xs mt-1 ${theme.textSecondary}`}>
            {sponsor.category === 'company' ? 'شركة' : 'شخص'} · متعاون منذ {formatDate(sponsor.since)}
          </p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>{sponsor.phone} {sponsor.email && `· ${sponsor.email}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Handshake} label="مرات الدعم" value={formatNumber(filteredDonations.length)} />
        <StatCard icon={Wallet} label="المبلغ" value={formatNumber(totalAmount)} suffix="ر.س" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className={`text-sm font-bold ${theme.textPrimary}`}>سجل الدعم</h2>
      </div>
      <div className="mb-3">
        <PillTabs items={yearTabs} value={yearFilter} onChange={setYearFilter} />
      </div>

      <div>
        {filteredDonations.map((d) => {
          const isFund = !d.program_id;
          return (
            <button
              key={d.id}
              onClick={() => d.program_id && navigate(`/programs/${d.program_id}`)}
              className={`w-full flex items-center gap-3 py-3.5 px-1 border-b ${theme.border} ${d.program_id ? theme.hover : ''} transition-colors text-right`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  isFund ? 'bg-violet-500/15 text-violet-500' : 'ain-accent-bg-soft'
                }`}
              >
                {isFund ? <Landmark className="h-5 w-5" /> : <HeartHandshake className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${theme.textPrimary}`}>{isFund ? 'دعم الصندوق' : d.program_name}</p>
                <p className={`text-xs truncate ${theme.textSecondary} flex items-center gap-1.5`}>
                  {formatDate(d.date)}
                  <span className="inline-flex items-center gap-1">
                    {d.support_type === 'cash' ? <Wallet className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                    {d.support_type === 'cash' ? 'مالي' : 'عيني'}
                  </span>
                  {d.support_type === 'inkind' && d.inkind_item && <span>— {d.inkind_item} (تقديري)</span>}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold flex items-center gap-1">
                {formatNumber(d.amount)}<RiyalSymbol className="h-3" />
              </span>
            </button>
          );
        })}
        {filteredDonations.length === 0 && (
          <p className={`text-sm py-8 text-center ${theme.textSecondary}`}>لا توجد دعمات مسجلة</p>
        )}
      </div>

      {showEdit && (
        <SponsorFormModal
          sponsor={sponsor}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="حذف راعٍ"
          message={
            <>
              <p>هل أنت متأكد من حذف <span className={`font-bold ${theme.textPrimary}`}>{sponsor.name}</span>؟</p>
              {sponsor.donations.length > 0 && (
                <p className="mt-2 text-red-500">سيتم حذف {formatNumber(sponsor.donations.length)} دعمة مرتبطة به أيضاً.</p>
              )}
              <p className="mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
            </>
          }
          onClose={() => setShowDelete(false)}
          onConfirm={async () => {
            await api.deleteSponsor(sponsor.id);
            navigate('/sponsors');
          }}
        />
      )}
    </Layout>
  );
}
