import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import Modal from './Modal';
import SearchField from './SearchField';
import ParticipationFields from './ParticipationFields';
import { useTheme } from '../theme';
import { api } from '../api';
import { formatDate } from '../format';
import { fuzzyFilter } from '../search';
import { groupProgramsByState, programSpan } from '../programState';
import { formToParticipation, participationToForm, validateParticipationForm } from '../../shared/participation.js';

const SEARCH_KEYS = ['name', 'location', 'executor_name', 'supervisor_name'];

function spanLabel(program) {
  const { start, end } = programSpan(program);
  if (!start) return 'بدون تاريخ';
  return start === end ? formatDate(start) : `${formatDate(start)} — ${formatDate(end)}`;
}

// Step 1: pick a program (grouped by state, fuzzy search). Step 2: role + hours.
export default function JoinProgramDialog({ volunteer, onClose, onSaved }) {
  const { theme } = useTheme();
  const [programs, setPrograms] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(() => participationToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.programs().then(setPrograms).catch((err) => setLoadError(err.message));
  }, []);

  const joined = useMemo(() => new Set(volunteer.programs.map((p) => p.id)), [volunteer]);
  const groups = useMemo(
    () => (programs ? groupProgramsByState(fuzzyFilter(programs, query, SEARCH_KEYS)) : []),
    [programs, query]
  );

  const submit = async (e) => {
    e.preventDefault();
    const found = validateParticipationForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.addProgramVolunteers(selected.id, [{ volunteer_id: volunteer.id, ...formToParticipation(form) }]);
      if (res.added === 0) throw new Error('المتطوع مسجل في هذا البرنامج مسبقاً');
      onSaved();
    } catch (err) {
      setErrors(err.fields ?? {});
      setError(err.message);
      setSaving(false);
    }
  };

  if (selected) {
    return (
      <Modal
        title="تفاصيل المشاركة"
        onClose={onClose}
        busy={saving}
        headerStart={
          <button type="button" aria-label="رجوع لاختيار البرنامج" disabled={saving} onClick={() => setSelected(null)}
            className={`rounded-full p-1 disabled:opacity-40 ${theme.textSecondary} ${theme.hover}`}>
            <ChevronRight className="h-5 w-5" />
          </button>
        }
        footer={
          <button form="join-program-form" type="submit" disabled={saving}
            className="ain-accent-solid w-full rounded-xl py-2.5 font-bold text-sm disabled:opacity-60">
            {saving ? 'جاري الإضافة...' : 'إضافة إلى البرنامج'}
          </button>
        }
      >
        <form id="join-program-form" onSubmit={submit} noValidate>
          <div className={`rounded-xl border ${theme.border} p-3 mb-4`}>
            <p className={`text-sm font-bold ${theme.textPrimary}`}>{selected.name}</p>
            <p className={`text-xs mt-0.5 ${theme.textSecondary}`}>{volunteer.name} · {spanLabel(selected)}</p>
          </div>
          <ParticipationFields value={form} onChange={(f) => { setForm(f); setErrors({}); }} errors={errors} />
          {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
        </form>
      </Modal>
    );
  }

  return (
    <Modal title="إضافة إلى برنامج" onClose={onClose} wide>
      <div className="mb-3">
        <SearchField value={query} onChange={setQuery} placeholder="ابحث باسم البرنامج أو الموقع..." autoFocus />
      </div>
      {!programs && !loadError && <p className={`text-sm py-6 text-center ${theme.textSecondary}`}>جاري التحميل...</p>}
      {loadError && <p role="alert" className="text-sm py-6 text-center text-red-500">{loadError}</p>}
      {programs && groups.length === 0 && (
        <p className={`text-sm py-6 text-center ${theme.textSecondary}`}>لا توجد برامج مطابقة</p>
      )}
      {groups.map((group) => (
        <section key={group.key} className="mb-3">
          <h3 className={`text-xs font-bold mb-1 ${theme.textMuted}`}>{group.label}</h3>
          {group.items.map((p) => {
            const isJoined = joined.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={isJoined}
                onClick={() => setSelected(p)}
                className={`w-full flex items-center gap-3 py-2.5 px-2 rounded-xl text-right transition-colors ${
                  isJoined ? 'opacity-55 cursor-not-allowed' : theme.hover
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${theme.textPrimary}`}>{p.name}</p>
                  <p className={`text-xs truncate flex items-center gap-3 ${theme.textSecondary}`}>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{spanLabel(p)}</span>
                    {p.location && <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{p.location}</span>}
                  </p>
                </div>
                {isJoined ? (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ain-accent-bg-soft">مسجّل</span>
                ) : (
                  <ChevronLeft className={`h-4 w-4 shrink-0 ${theme.textMuted}`} />
                )}
              </button>
            );
          })}
        </section>
      ))}
    </Modal>
  );
}
