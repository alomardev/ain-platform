import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, HandHeart, Plus, Calendar, UserCircle2, Handshake } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import PillTabs from '../components/PillTabs';
import ListRow from '../components/ListRow';
import Modal from '../components/Modal';
import Field, { inputClass } from '../components/Field';
import { useTheme } from '../theme';
import { formatDate, formatNumber } from '../format';
import { api } from '../api';

const TYPE_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'internal', label: 'داخلي' },
  { key: 'external', label: 'خارجي' },
];

function AddProgramModal({ onClose, onSaved }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: '', description: '', category: 'internal', executor_name: '', location: '',
    supervisor_name: '', beneficiaries: 0, date_mode: 'single', date: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const dates = form.date ? [form.date] : [];
      await api.createProgram({ ...form, beneficiaries: Number(form.beneficiaries) || 0, dates });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="إضافة برنامج" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="اسم البرنامج">
          <input required className={inputClass(theme)} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="الوصف">
          <textarea className={inputClass(theme)} rows={2} value={form.description} onChange={set('description')} />
        </Field>
        <Field label="التصنيف">
          <select className={inputClass(theme)} value={form.category} onChange={set('category')}>
            <option value="internal">داخلي</option>
            <option value="external">خارجي</option>
          </select>
        </Field>
        {form.category === 'external' && (
          <Field label="الجهة المنفذة">
            <input className={inputClass(theme)} value={form.executor_name} onChange={set('executor_name')} />
          </Field>
        )}
        <Field label="الموقع">
          <input className={inputClass(theme)} value={form.location} onChange={set('location')} />
        </Field>
        <Field label="المشرف">
          <input className={inputClass(theme)} value={form.supervisor_name} onChange={set('supervisor_name')} />
        </Field>
        <Field label="عدد المستفيدين">
          <input type="number" className={inputClass(theme)} value={form.beneficiaries} onChange={set('beneficiaries')} />
        </Field>
        <Field label="تاريخ البرنامج">
          <input type="date" className={inputClass(theme)} value={form.date} onChange={set('date')} />
        </Field>
        <button disabled={saving} type="submit" className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm mt-2 disabled:opacity-60">
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </form>
    </Modal>
  );
}

export default function Programs() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [programs, setPrograms] = useState([]);
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.programs().then(setPrograms).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const years = useMemo(
    () => [...new Set(programs.map((p) => (p.dates[0] || '').slice(0, 4)))].filter(Boolean).sort().reverse(),
    [programs]
  );

  const filtered = useMemo(() => {
    let list = programs;
    if (yearFilter !== 'all') list = list.filter((p) => (p.dates[0] || '').startsWith(yearFilter));
    if (typeFilter !== 'all') list = list.filter((p) => p.category === typeFilter);
    return [...list].sort((a, b) => (b.dates[0] || '').localeCompare(a.dates[0] || ''));
  }, [programs, yearFilter, typeFilter]);

  const statsBeneficiaries = useMemo(() => filtered.reduce((s, p) => s + (p.beneficiaries || 0), 0), [filtered]);
  const yearTabs = [{ key: 'all', label: 'الكل' }, ...years.map((y) => ({ key: y, label: y }))];

  return (
    <Layout>
      <PageHeader
        title="البرامج"
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="ain-accent-solid flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة برنامج
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={ClipboardList} label="البرامج" value={formatNumber(filtered.length)} />
        <StatCard icon={HandHeart} label="المستفيدين" value={formatNumber(statsBeneficiaries)} />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <PillTabs items={yearTabs} value={yearFilter} onChange={setYearFilter} />
        <PillTabs items={TYPE_TABS} value={typeFilter} onChange={setTypeFilter} />
      </div>

      {loading && <p className={`text-sm ${theme.textSecondary}`}>جاري التحميل...</p>}

      <div>
        {filtered.map((p) => (
          <ListRow
            key={p.id}
            onClick={() => navigate(`/programs/${p.id}`)}
            main={
              <span className="flex items-center gap-2">
                {p.name}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  p.category === 'internal' ? 'ain-accent-bg-soft' : 'bg-violet-500/15 text-violet-500'
                }`}>
                  {p.category === 'internal' ? 'داخلي' : 'خارجي'}
                </span>
              </span>
            }
            meta={
              <span className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(p.dates[0])}</span>
                {p.supervisor_name && <span className="flex items-center gap-1"><UserCircle2 className="h-3 w-3" />{p.supervisor_name}</span>}
              </span>
            }
            trailing={
              <span className={`text-xs font-semibold ${theme.textSecondary} flex items-center gap-1`}>
                <Handshake className="h-3.5 w-3.5" />{p.volunteer_count}
              </span>
            }
          />
        ))}
        {!loading && filtered.length === 0 && (
          <p className={`text-sm py-8 text-center ${theme.textSecondary}`}>لا توجد برامج مطابقة</p>
        )}
      </div>

      {showAdd && (
        <AddProgramModal
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
