import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';
import Modal from './Modal';
import SearchField from './SearchField';
import PillTabs from './PillTabs';
import Avatar from './Avatar';
import ParticipationFields from './ParticipationFields';
import { useTheme } from '../theme';
import { api } from '../api';
import { fuzzyFilter } from '../search';
import { formToParticipation, participationToForm, validateParticipationForm } from '../../shared/participation.js';

const SEARCH_KEYS = ['name', 'phone', 'national_id'];
const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'm', label: 'المتطوعون' },
  { key: 'f', label: 'المتطوعات' },
];

function Checkbox({ checked, disabled }) {
  return (
    <span
      aria-hidden="true"
      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'ain-accent-solid border-transparent' : 'border-gray-400'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}

// Step 1: multi-select volunteers (fuzzy search + gender filter). Step 2: role + hours per volunteer.
export default function AddVolunteersDialog({ program, onClose, onSaved }) {
  const { theme } = useTheme();
  const [volunteers, setVolunteers] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]); // keeps pick order
  const [step, setStep] = useState('pick');
  const [forms, setForms] = useState({}); // volunteerId -> { roleKey, customRole, hours }
  const [bulk, setBulk] = useState(() => participationToForm(null));
  const [rowErrors, setRowErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.volunteers().then(setVolunteers).catch((err) => setLoadError(err.message));
  }, []);

  const members = useMemo(() => new Set(program.volunteers.map((v) => v.id)), [program]);
  const byId = useMemo(() => new Map((volunteers ?? []).map((v) => [v.id, v])), [volunteers]);
  const visible = useMemo(() => {
    if (!volunteers) return [];
    const byTab = tab === 'all' ? volunteers : volunteers.filter((v) => v.gender === tab);
    const results = fuzzyFilter(byTab, query, SEARCH_KEYS);
    return query.trim() ? results : [...results].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [volunteers, tab, query]);

  const selected = new Set(selectedIds);
  const selectable = visible.filter((v) => !members.has(v.id));
  const allVisibleSelected = selectable.length > 0 && selectable.every((v) => selected.has(v.id));

  const toggle = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const toggleAllVisible = () =>
    setSelectedIds((ids) => {
      const visibleIds = selectable.map((v) => v.id);
      if (allVisibleSelected) return ids.filter((id) => !visibleIds.includes(id));
      return [...ids, ...visibleIds.filter((id) => !ids.includes(id))];
    });

  const goToDetails = () => {
    setForms((prev) => Object.fromEntries(selectedIds.map((id) => [id, prev[id] ?? participationToForm(null)])));
    setRowErrors({});
    setError('');
    setStep('details');
  };

  const setRow = (id, f) => {
    setForms((prev) => ({ ...prev, [id]: f }));
    setRowErrors((prev) => ({ ...prev, [id]: undefined }));
  };
  const applyToAll = () => {
    setForms(Object.fromEntries(selectedIds.map((id) => [id, { ...bulk }])));
    setRowErrors({});
  };
  const removeRow = (id) => {
    const rest = selectedIds.filter((x) => x !== id);
    setSelectedIds(rest);
    if (rest.length === 0) setStep('pick');
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    for (const id of selectedIds) {
      const errs = validateParticipationForm(forms[id]);
      if (Object.keys(errs).length > 0) found[id] = errs;
    }
    setRowErrors(found);
    if (Object.keys(found).length > 0) {
      setError('أكمل الدور وعدد الساعات لكل متطوع');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.addProgramVolunteers(
        program.id,
        selectedIds.map((id) => ({ volunteer_id: id, ...formToParticipation(forms[id]) }))
      );
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (step === 'details') {
    return (
      <Modal
        title="تفاصيل المشاركة"
        wide
        onClose={onClose}
        busy={saving}
        headerStart={
          <button type="button" aria-label="رجوع لاختيار المتطوعين" disabled={saving} onClick={() => setStep('pick')}
            className={`rounded-full p-1 disabled:opacity-40 ${theme.textSecondary} ${theme.hover}`}>
            <ChevronRight className="h-5 w-5" />
          </button>
        }
        footer={
          <>
            {error && <p role="alert" className="text-xs text-red-500 mb-2">{error}</p>}
            <button form="add-volunteers-form" type="submit" disabled={saving}
              className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm disabled:opacity-60">
              {saving ? 'جاري الإضافة...' : `إضافة (${selectedIds.length})`}
            </button>
          </>
        }
      >
        <form id="add-volunteers-form" onSubmit={submit} noValidate>
          {selectedIds.length > 1 && (
            <div className="rounded-xl p-3 mb-4 ain-accent-bg-soft">
              <p className={`text-xs font-bold mb-2 ${theme.textPrimary}`}>تطبيق على الجميع</p>
              <ParticipationFields compact value={bulk} onChange={setBulk} />
              <button type="button" onClick={applyToAll}
                className="ain-accent-solid mt-2 rounded-full px-4 py-1.5 text-xs font-bold">
                تطبيق على {selectedIds.length} متطوعين
              </button>
            </div>
          )}
          <div className={`divide-y ${theme.divide}`}>
            {selectedIds.map((id) => {
              const v = byId.get(id);
              if (!v || !forms[id]) return null;
              return (
                <div key={id} className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar photo={v.photo} gender={v.gender} className="h-7 w-7" iconClassName="h-4 w-4" />
                    <p className={`flex-1 text-sm font-semibold truncate ${theme.textPrimary}`}>{v.name}</p>
                    <button type="button" aria-label={`إزالة ${v.name} من القائمة`} onClick={() => removeRow(id)}
                      className={`rounded-full p-1 ${theme.textMuted} ${theme.hover}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ParticipationFields compact value={forms[id]} onChange={(f) => setRow(id, f)} errors={rowErrors[id]} />
                </div>
              );
            })}
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal
      title="إضافة متطوعين"
      wide
      onClose={onClose}
      footer={
        <button type="button" disabled={selectedIds.length === 0} onClick={goToDetails}
          className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm disabled:opacity-50">
          {selectedIds.length === 0 ? 'اختر متطوعاً أو أكثر' : `التالي (${selectedIds.length})`}
        </button>
      }
    >
      <div className="mb-3">
        <SearchField value={query} onChange={setQuery} placeholder="ابحث بالاسم أو الجوال أو رقم الهوية..." autoFocus />
      </div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <PillTabs items={TABS} value={tab} onChange={setTab} />
        {selectable.length > 0 && (
          <button type="button" onClick={toggleAllVisible} className="text-xs font-semibold ain-accent-text shrink-0">
            {allVisibleSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
          </button>
        )}
      </div>

      {!volunteers && !loadError && <p className={`text-sm py-6 text-center ${theme.textSecondary}`}>جاري التحميل...</p>}
      {loadError && <p role="alert" className="text-sm py-6 text-center text-red-500">{loadError}</p>}
      {volunteers && visible.length === 0 && (
        <p className={`text-sm py-6 text-center ${theme.textSecondary}`}>لا يوجد متطوعون مطابقون</p>
      )}

      <div role="group" aria-label="المتطوعون">
        {visible.map((v) => {
          const isMember = members.has(v.id);
          const checked = isMember || selected.has(v.id);
          return (
            <button
              key={v.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              disabled={isMember}
              onClick={() => toggle(v.id)}
              className={`w-full flex items-center gap-3 py-2 px-2 rounded-xl text-right transition-colors ${
                isMember ? 'opacity-55 cursor-not-allowed' : theme.hover
              }`}
            >
              <Checkbox checked={checked} disabled={isMember} />
              <Avatar photo={v.photo} gender={v.gender} className="h-9 w-9" iconClassName="h-4.5 w-4.5" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${theme.textPrimary}`}>{v.name}</p>
                {v.phone && <p dir="ltr" className={`text-xs truncate text-right ${theme.textSecondary}`}>{v.phone}</p>}
              </div>
              {isMember && <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ain-accent-bg-soft">مسجّل</span>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
