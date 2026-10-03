import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, HandHeart, Handshake, ChevronDown, Calendar, MapPin, UserCircle2,
  Building2, Crown, StickyNote, Wallet, Package,
} from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ListRow from '../components/ListRow';
import RiyalSymbol from '../components/RiyalSymbol';
import EditDeleteActions from '../components/EditDeleteActions';
import ProgramFormModal from '../components/ProgramFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../theme';
import { formatDate, formatNumber } from '../format';
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

function Chip({ children }) {
  const { theme } = useTheme();
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${theme.border} ${theme.textSecondary}`}>
      {children}
    </span>
  );
}

function dateSummary(program) {
  if (program.date_mode === 'single') return formatDate(program.dates[0]);
  if (program.date_mode === 'range') return `${formatDate(program.dates[0])} — ${formatDate(program.dates[1])}`;
  return program.dates.map(formatDate).join('، ');
}

function daysCount(program) {
  if (program.date_mode === 'single') return 1;
  if (program.date_mode === 'range') {
    const [a, b] = program.dates;
    if (!a || !b) return 1;
    return Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
  }
  return program.dates.length;
}

export default function ProgramProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [program, setProgram] = useState(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const load = () => {
    api.program(id).then(setProgram).catch(() => {});
  };
  useEffect(load, [id]);

  const orderedVolunteers = useMemo(() => {
    if (!program) return [];
    return [...program.volunteers].sort((a, b) => {
      if (a.is_supervisor !== b.is_supervisor) return b.is_supervisor - a.is_supervisor;
      if (a.is_deputy !== b.is_deputy) return b.is_deputy - a.is_deputy;
      return b.hours - a.hours;
    });
  }, [program]);

  if (!program) {
    return (
      <Layout>
        <p className={`text-sm ${theme.textSecondary}`}>جاري التحميل...</p>
      </Layout>
    );
  }

  const firstDate = formatDate(program.dates[0]);

  return (
    <Layout>
      <PageHeader
        backTo="/programs"
        backLabel="البرامج"
        action={<EditDeleteActions onEdit={() => setShowEdit(true)} onDelete={() => setShowDelete(true)} />}
      />

      <div className="mb-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className={`text-xl font-extrabold ain-accent-text`}>{program.name}</h1>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            program.category === 'internal' ? 'ain-accent-bg-soft' : 'bg-violet-500/15 text-violet-500'
          }`}>
            {program.category === 'internal' ? 'داخلي' : 'خارجي'}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/15 text-green-600">
            {program.status}
          </span>
        </div>
        <p className={`text-sm ${theme.textSecondary}`}>{firstDate}</p>
      </div>

      {program.description && (
        <p className={`text-sm leading-relaxed mt-3 mb-5 ${theme.textSecondary}`}>{program.description}</p>
      )}

      <div className="@container mb-6">
        <div className="grid grid-cols-1 @lg:grid-cols-3 gap-3">
          <StatCard compact icon={Handshake} label="المتطوعين" value={formatNumber(program.totalVolunteers)} />
          <StatCard compact icon={Clock} label="الساعات" value={formatNumber(program.totalHours)} />
          <StatCard compact icon={HandHeart} label="المستفيدين" value={formatNumber(program.beneficiaries)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className={`text-sm font-bold mb-2 ${theme.textPrimary}`}>بيانات البرنامج</h2>
          <div className={`rounded-2xl border ${theme.cardBorder} px-4 divide-y ${theme.divide} mb-4`} style={{ backgroundColor: theme.card }}>
            <DetailRow icon={UserCircle2} label="المشرف" value={program.supervisor_name} />
            <DetailRow icon={Calendar} label="عدد الأيام" value={`${daysCount(program)} ${daysCount(program) === 1 ? 'يوم' : 'أيام'}`} />
            <DetailRow icon={Calendar} label={program.date_mode === 'multiple' ? 'التواريخ' : program.date_mode === 'range' ? 'من — إلى' : 'التاريخ'} value={dateSummary(program)} />
            <DetailRow icon={MapPin} label="الموقع" value={program.location} />
            <div className="flex items-center gap-3 py-2.5">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${theme.hover}`}>
                <Building2 className={`h-4 w-4 ${theme.textSecondary}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs ${theme.textMuted}`}>الجهة المنفذة</p>
                <p className={`text-sm font-medium truncate ${theme.textPrimary}`}>{program.executor_name}</p>
              </div>
            </div>
          </div>

          {program.sponsors.length > 0 && (
            <div className="mb-4">
              <h3 className={`text-xs font-bold mb-2 ${theme.textSecondary}`}>الراعي</h3>
              <div className="flex flex-wrap gap-2">
                {program.sponsors.map((s) => (
                  <button key={s.id} onClick={() => navigate(`/sponsors/${s.id}`)}>
                    <Chip>{s.name}</Chip>
                  </button>
                ))}
              </div>
            </div>
          )}

          {program.partners.length > 0 && (
            <div>
              <h3 className={`text-xs font-bold mb-2 ${theme.textSecondary}`}>الجهات المشاركة</h3>
              <div className="flex flex-wrap gap-2">
                {program.partners.map((p) => (
                  <Chip key={p.id}>{p.name}</Chip>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className={`text-sm font-bold mb-2 ${theme.textPrimary}`}>قائمة المتطوعين</h2>
          <div>
            {orderedVolunteers.map((v) => (
              <ListRow
                key={v.id}
                onClick={() => navigate(`/volunteers/${v.id}`)}
                leading={
                  v.is_supervisor || v.is_deputy ? (
                    <div className="h-9 w-9 rounded-full ain-accent-solid flex items-center justify-center shrink-0 relative">
                      <Crown className="h-4.5 w-4.5" />
                      {v.is_deputy && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-current rounded" />}
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full ain-accent-bg-soft flex items-center justify-center shrink-0">
                      <UserCircle2 className="h-4.5 w-4.5" />
                    </div>
                  )
                }
                main={v.name}
                meta={v.role}
                trailing={<span className={`text-xs font-semibold ${theme.textSecondary}`}>{formatNumber(v.hours)} س</span>}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-6 rounded-2xl border ${theme.cardBorder} p-4 ${theme.textPrimary}`} style={{ backgroundColor: theme.card }}>
        <button onClick={() => setBudgetOpen((o) => !o)} className={`w-full flex items-center justify-between ${theme.textPrimary}`}>
          <span className={`flex items-center gap-2 font-bold text-sm ${theme.textPrimary}`}>
            <Wallet className="h-4 w-4 ain-accent-text" /> ميزانية البرنامج
          </span>
          <span className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${theme.textSecondary}`}>{formatNumber(program.funding.length)} دعم</span>
            <span className={`font-extrabold flex items-center gap-1 ${theme.textPrimary}`}>
              {formatNumber(program.funding.reduce((s, f) => s + f.amount, 0))}
              <RiyalSymbol className="h-3.5" />
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${theme.textSecondary} ${budgetOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {budgetOpen && (
          <div className={`mt-3 divide-y ${theme.divide}`}>
            {program.funding.map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/sponsors/${f.sponsor_id}`)}
                className={`w-full py-2.5 px-1 flex items-center justify-between gap-3 text-right rounded-lg ${theme.hover} transition-colors`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {f.support_type === 'cash'
                    ? <Wallet className={`h-4 w-4 shrink-0 ${theme.textSecondary}`} />
                    : <Package className={`h-4 w-4 shrink-0 ${theme.textSecondary}`} />}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${theme.textPrimary}`}>{f.sponsor_name}</p>
                    {f.support_type === 'inkind' && f.inkind_item && (
                      <p className={`text-xs truncate ${theme.textMuted}`}>{f.inkind_item} — تقديري</p>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-semibold flex items-center gap-1 shrink-0 ${theme.textPrimary}`}>
                  {formatNumber(f.amount)}<RiyalSymbol className="h-3" />
                </span>
              </button>
            ))}
            {program.funding.length === 0 && <p className={`text-sm py-3 ${theme.textSecondary}`}>لا يوجد دعم مسجل</p>}
          </div>
        )}
      </div>

      {program.notes && (
        <div className={`mt-4 rounded-2xl border ${theme.cardBorder} p-4`} style={{ backgroundColor: theme.card }}>
          <button onClick={() => setNotesOpen((o) => !o)} className={`w-full flex items-center justify-between ${theme.textPrimary}`}>
            <span className={`flex items-center gap-2 font-bold text-sm ${theme.textPrimary}`}>
              <StickyNote className="h-4 w-4 ain-accent-text" /> الملاحظات
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${theme.textSecondary} ${notesOpen ? 'rotate-180' : ''}`} />
          </button>
          {notesOpen && <p className={`mt-3 text-sm leading-relaxed ${theme.textSecondary}`}>{program.notes}</p>}
        </div>
      )}

      {showEdit && (
        <ProgramFormModal
          program={program}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="حذف برنامج"
          message={
            <>
              <p>هل أنت متأكد من حذف <span className={`font-bold ${theme.textPrimary}`}>{program.name}</span>؟</p>
              {program.volunteers.length > 0 && (
                <p className="mt-2 text-red-500">سيتم حذف {formatNumber(program.volunteers.length)} مشاركة مرتبطة به أيضاً.</p>
              )}
              {program.funding.length > 0 && (
                <p className="mt-2">سيتم تحويل {formatNumber(program.funding.length)} دعم مرتبط به إلى دعم الصندوق.</p>
              )}
              <p className="mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
            </>
          }
          onClose={() => setShowDelete(false)}
          onConfirm={async () => {
            await api.deleteProgram(program.id);
            navigate('/programs');
          }}
        />
      )}
    </Layout>
  );
}
