import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ClipboardList, Phone, Mail, CreditCard, Cake, Briefcase, GraduationCap, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import PillTabs from '../components/PillTabs';
import ListRow from '../components/ListRow';
import Avatar from '../components/Avatar';
import EditDeleteActions from '../components/EditDeleteActions';
import VolunteerFormModal from '../components/VolunteerFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../theme';
import { formatDate, formatNumber, yearOf } from '../format';
import { api } from '../api';

function DetailRow({ icon: Icon, label, value }) {
  const { theme } = useTheme();
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${theme.hover}`}>
        <Icon className={`h-4 w-4 ${theme.textSecondary}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-xs ${theme.textMuted}`}>{label}</p>
        <p className={`text-sm font-medium truncate ${theme.textPrimary}`}>{value}</p>
      </div>
    </div>
  );
}

export default function VolunteerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [volunteer, setVolunteer] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const load = () => {
    api.volunteer(id).then(setVolunteer).catch(() => {});
  };
  useEffect(load, [id]);

  const years = useMemo(() => {
    if (!volunteer) return [];
    return [...new Set(volunteer.programs.map((p) => yearOf(p.date)))].filter(Boolean).sort().reverse();
  }, [volunteer]);

  const filteredPrograms = useMemo(() => {
    if (!volunteer) return [];
    const list = yearFilter === 'all' ? volunteer.programs : volunteer.programs.filter((p) => yearOf(p.date) === yearFilter);
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [volunteer, yearFilter]);

  const statsHours = useMemo(() => filteredPrograms.reduce((s, p) => s + p.hours, 0), [filteredPrograms]);
  const statsPrograms = filteredPrograms.length;

  if (!volunteer) {
    return (
      <Layout>
        <p className={`text-sm ${theme.textSecondary}`}>جاري التحميل...</p>
      </Layout>
    );
  }

  const yearTabs = [{ key: 'all', label: 'الكل' }, ...years.map((y) => ({ key: y, label: y }))];
  const hoursLabel = yearFilter === 'all' ? 'الساعات' : `الساعات (${yearFilter})`;
  const programsLabel = yearFilter === 'all' ? 'البرامج' : `البرامج (${yearFilter})`;

  return (
    <Layout>
      <PageHeader
        backTo="/volunteers"
        backLabel="المتطوعون"
        action={<EditDeleteActions onEdit={() => setShowEdit(true)} onDelete={() => setShowDelete(true)} />}
      />

      <div className="flex items-center gap-4 mb-6">
        <Avatar photo={volunteer.photo} gender={volunteer.gender} alt={volunteer.name} className="h-20 w-20" iconClassName="h-9 w-9" />
        <div>
          <h1 className={`text-xl font-extrabold ain-accent-text`}>{volunteer.name}</h1>
          <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            volunteer.status === 'active' ? 'bg-green-500/15 text-green-600' : 'bg-gray-500/15 text-gray-500'
          }`}>
            {volunteer.status === 'active' ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Clock} label={hoursLabel} value={formatNumber(statsHours)} suffix="ساعة" />
        <StatCard icon={ClipboardList} label={programsLabel} value={formatNumber(statsPrograms)} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className={`text-sm font-bold mb-2 ${theme.textPrimary}`}>البيانات الشخصية</h2>
          <div className={`rounded-2xl border ${theme.cardBorder} px-4 divide-y ${theme.divide}`} style={{ backgroundColor: theme.card }}>
            <DetailRow icon={CreditCard} label="رقم الهوية الوطنية" value={volunteer.national_id} />
            <DetailRow icon={Cake} label="تاريخ الميلاد" value={formatDate(volunteer.birth_date)} />
            <DetailRow icon={Phone} label="رقم الجوال" value={volunteer.phone} />
            <DetailRow icon={Mail} label="البريد الإلكتروني" value={volunteer.email} />
            <DetailRow icon={GraduationCap} label="المؤهل العلمي" value={volunteer.qualification} />
            <DetailRow icon={Briefcase} label="الوظيفة" value={volunteer.job} />
            <DetailRow icon={Calendar} label="تاريخ الانضمام" value={formatDate(volunteer.join_date)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-sm font-bold ${theme.textPrimary}`}>سجل المشاركات</h2>
          </div>
          <div className="mb-2">
            <PillTabs items={yearTabs} value={yearFilter} onChange={setYearFilter} />
          </div>
          <div>
            {filteredPrograms.map((p) => (
              <ListRow
                key={p.id}
                onClick={() => navigate(`/programs/${p.id}`)}
                main={p.name}
                meta={`${p.role} · ${formatDate(p.date)}`}
                trailing={<span className={`text-xs font-semibold ${theme.textSecondary}`}>{formatNumber(p.hours)} س</span>}
              />
            ))}
            {filteredPrograms.length === 0 && (
              <p className={`text-sm py-6 text-center ${theme.textSecondary}`}>لا توجد مشاركات</p>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <VolunteerFormModal
          volunteer={volunteer}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="حذف متطوع"
          message={
            <>
              <p>هل أنت متأكد من حذف <span className={`font-bold ${theme.textPrimary}`}>{volunteer.name}</span>؟</p>
              {volunteer.programs.length > 0 && (
                <p className="mt-2 text-red-500">سيتم حذف {formatNumber(volunteer.programs.length)} مشاركة مرتبطة به أيضاً.</p>
              )}
              <p className="mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
            </>
          }
          onClose={() => setShowDelete(false)}
          onConfirm={async () => {
            await api.deleteVolunteer(volunteer.id);
            navigate('/volunteers');
          }}
        />
      )}
    </Layout>
  );
}
