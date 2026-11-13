import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Loader2, ChevronRight } from 'lucide-react';
import AinMark from '../components/AinMark';
import GenderIcon from '../components/GenderIcon';
import { ACCENT_LIGHT } from '../theme';
import { formatDate, formatNumber, yearOf } from '../format';
import { dateSummary, daysCount } from '../programState';
import { todayIso } from '../../shared/volunteer.js';
import { api } from '../api';
import { downloadVolunteerPdf } from '../volunteerPdf';

// A4 volunteer profile. functions/api/volunteers/[id]/pdf.js renders this page (?render=pdf) in headless
// Chromium, so the PDF keeps Arabic text selectable and correctly shaped and lets programs flow onto extra pages.

const ORG_NAME = 'جمعية العيون التطوعية';

const styles = `
  @page { size: A4; margin: 14mm 14mm 16mm; }
  @page {
    @bottom-center {
      content: counter(page) " / " counter(pages);
      font-family: 'Tajawal', sans-serif;
      font-size: 8pt;
      color: #9CA3AF;
    }
  }

  .vr-root {
    --vr-accent: ${ACCENT_LIGHT};
    --vr-accent-soft: rgba(29,149,166,0.10);
    --vr-ink: #111827;
    --vr-ink-2: #4B5563;
    --vr-ink-3: #9CA3AF;
    --vr-line: #E5E7EB;
    --vr-surface: #F7F8FA;
    min-height: 100vh;
    background: #E5E7EB;
    color: var(--vr-ink);
    font-family: 'Tajawal', 'Segoe UI', sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .vr-toolbar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--vr-line);
  }
  .vr-btn {
    display: inline-flex; align-items: center; gap: 6px;
    border-radius: 999px; padding: 7px 14px;
    font: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
    border: 1px solid var(--vr-line); background: #fff; color: var(--vr-ink-2);
  }
  .vr-btn-primary { background: var(--vr-accent); border-color: var(--vr-accent); color: #fff; }
  .vr-btn:disabled { opacity: .5; cursor: default; }

  .vr-sheet {
    width: 210mm; max-width: calc(100% - 32px);
    min-height: 297mm;
    margin: 24px auto 48px;
    padding: 14mm;
    background: #fff;
    box-shadow: 0 10px 40px rgba(17,24,39,0.12);
    font-size: 10pt; line-height: 1.55;
  }

  .vr-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 5mm; border-bottom: 2px solid var(--vr-accent); }
  .vr-brand { display: flex; align-items: center; gap: 3mm; }
  .vr-brand-mark { width: 12mm; height: 12mm; }
  .vr-brand-name { font-weight: 800; font-size: 12pt; }
  .vr-brand-sub { font-size: 8.5pt; color: var(--vr-ink-3); }
  .vr-doc { text-align: left; }
  .vr-doc-title { font-weight: 800; font-size: 13pt; color: var(--vr-accent); }
  .vr-doc-meta { font-size: 8.5pt; color: var(--vr-ink-3); }

  .vr-hero { display: flex; align-items: center; gap: 6mm; margin-top: 7mm; }
  .vr-photo {
    width: 32mm; height: 32mm; flex-shrink: 0;
    border-radius: 7mm; object-fit: cover;
    border: 1px solid var(--vr-line);
  }
  .vr-photo-fallback { display: flex; align-items: center; justify-content: center; background: var(--vr-accent-soft); color: var(--vr-accent); border: none; }
  .vr-name { font-size: 20pt; font-weight: 800; line-height: 1.25; margin: 0; }
  .vr-tagline { color: var(--vr-ink-2); font-size: 10.5pt; margin-top: 1mm; }
  .vr-badges { display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 3mm; }
  .vr-badge { font-size: 8.5pt; font-weight: 700; padding: 0.6mm 3mm; border-radius: 999px; background: var(--vr-surface); color: var(--vr-ink-2); border: 1px solid var(--vr-line); }
  .vr-badge-active { background: rgba(22,163,74,0.10); color: #15803D; border-color: rgba(22,163,74,0.25); }

  .vr-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-top: 7mm; }
  .vr-stat { background: var(--vr-surface); border-radius: 3mm; padding: 3mm 4mm; }
  .vr-stat-label { font-size: 8.5pt; color: var(--vr-ink-3); }
  .vr-stat-value { font-size: 15pt; font-weight: 800; color: var(--vr-ink); line-height: 1.3; }
  .vr-stat-unit { font-size: 8.5pt; font-weight: 500; color: var(--vr-ink-2); margin-inline-start: 1mm; }

  .vr-section { margin-top: 8mm; }
  .vr-section-title { display: flex; align-items: baseline; gap: 2mm; font-size: 11.5pt; font-weight: 800; margin: 0 0 3mm; break-after: avoid; }
  .vr-section-title::before { content: ''; width: 1.2mm; height: 4mm; border-radius: 1mm; background: var(--vr-accent); align-self: center; }
  .vr-section-count { font-size: 9pt; font-weight: 500; color: var(--vr-ink-3); }

  .vr-fields { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--vr-line); border-radius: 3mm; overflow: hidden; }
  .vr-field { padding: 2.5mm 4mm; border-bottom: 1px solid var(--vr-line); border-inline-start: 1px solid var(--vr-line); min-width: 0; }
  .vr-field:nth-child(3n+1) { border-inline-start: none; }
  .vr-field:nth-last-child(-n+3) { border-bottom: none; }
  .vr-field-label { font-size: 8pt; color: var(--vr-ink-3); }
  .vr-field-value { font-weight: 700; overflow-wrap: anywhere; }
  .vr-ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }

  .vr-programs { display: flex; flex-direction: column; gap: 3mm; }
  .vr-program {
    display: grid; grid-template-columns: 8mm 1fr auto; gap: 4mm; align-items: start;
    padding: 4mm; border: 1px solid var(--vr-line); border-radius: 3mm;
    break-inside: avoid; page-break-inside: avoid;
  }
  .vr-index { width: 8mm; height: 8mm; border-radius: 2mm; background: var(--vr-accent-soft); color: var(--vr-accent); font-weight: 800; font-size: 9pt; display: flex; align-items: center; justify-content: center; }
  .vr-program-head { display: flex; align-items: center; flex-wrap: wrap; gap: 2mm; }
  .vr-program-name { font-weight: 800; font-size: 11pt; }
  .vr-chip { font-size: 7.5pt; font-weight: 700; padding: 0.3mm 2.2mm; border-radius: 999px; background: var(--vr-surface); color: var(--vr-ink-2); }
  .vr-chip-internal { background: var(--vr-accent-soft); color: var(--vr-accent); }
  .vr-chip-external { background: rgba(124,58,237,0.10); color: #6D28D9; }
  .vr-program-desc { color: var(--vr-ink-2); font-size: 9pt; margin-top: 1mm; }
  .vr-program-meta { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; column-gap: 7mm; row-gap: 1.5mm; margin-top: 2.5mm; }
  .vr-meta-label { font-size: 7.5pt; color: var(--vr-ink-3); }
  .vr-meta-value { font-size: 9pt; font-weight: 700; }
  .vr-program-side { text-align: center; min-width: 22mm; padding-inline-start: 4mm; border-inline-start: 1px dashed var(--vr-line); }
  .vr-hours { font-size: 16pt; font-weight: 800; color: var(--vr-accent); line-height: 1.2; }
  .vr-hours-unit { font-size: 8pt; color: var(--vr-ink-3); }
  .vr-role { margin-top: 1.5mm; font-size: 8.5pt; font-weight: 700; color: var(--vr-ink); }

  .vr-empty { text-align: center; color: var(--vr-ink-3); padding: 8mm; border: 1px dashed var(--vr-line); border-radius: 3mm; }
  .vr-footer { margin-top: 10mm; padding-top: 3mm; border-top: 1px solid var(--vr-line); display: flex; justify-content: space-between; font-size: 8pt; color: var(--vr-ink-3); break-inside: avoid; }
  .vr-loading { text-align: center; padding: 80px 16px; color: var(--vr-ink-2); }

  @media screen and (width < 48rem) {
    .vr-sheet { padding: 16px; min-height: 0; }
    .vr-stats { grid-template-columns: repeat(2, 1fr); }
    .vr-fields { grid-template-columns: repeat(2, 1fr); }
    .vr-field:nth-child(3n+1) { border-inline-start: 1px solid var(--vr-line); }
    .vr-field:nth-child(2n+1) { border-inline-start: none; }
    .vr-program-meta { grid-template-columns: repeat(2, auto); }
  }

  .vr-render { background: #fff; }
  .vr-render .vr-sheet { margin: 0; box-shadow: none; }

  @media print {
    html, body, #root { height: auto; background: #fff; }
    .vr-root { background: #fff; min-height: 0; }
    .vr-toolbar { display: none; }
    .vr-sheet { width: auto; max-width: none; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
  }
`;

function ageFrom(birthDate) {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age >= 0 ? age : null;
}

function Field({ label, value, ltr }) {
  return (
    <div className="vr-field">
      <div className="vr-field-label">{label}</div>
      <div className="vr-field-value">{value ? (ltr ? <span className="vr-ltr">{value}</span> : value) : '—'}</div>
    </div>
  );
}

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div className="vr-meta-label">{label}</div>
      <div className="vr-meta-value">{value}</div>
    </div>
  );
}

function ProgramItem({ index, program: p }) {
  const days = daysCount(p);
  const dateLabel = p.date_mode === 'multiple' ? 'تواريخ البرنامج' : p.date_mode === 'range' ? 'فترة البرنامج' : 'تاريخ البرنامج';
  return (
    <div className="vr-program">
      <div className="vr-index">{formatNumber(index)}</div>
      <div style={{ minWidth: 0 }}>
        <div className="vr-program-head">
          <span className="vr-program-name">{p.name}</span>
          {p.category && (
            <span className={`vr-chip vr-chip-${p.category}`}>{p.category === 'internal' ? 'داخلي' : 'خارجي'}</span>
          )}
        </div>
        {p.description && <div className="vr-program-desc">{p.description}</div>}
        <div className="vr-program-meta">
          <Meta label="تاريخ المشاركة" value={formatDate(p.date)} />
          <Meta label={dateLabel} value={p.dates?.length ? dateSummary(p) : ''} />
          <Meta label="مدة البرنامج" value={p.dates?.length ? `${formatNumber(days)} ${days === 1 ? 'يوم' : 'أيام'}` : ''} />
          <Meta label="الموقع" value={p.location} />
          <Meta label="الجهة المنفذة" value={p.executor_name} />
          <Meta label="مشرف البرنامج" value={p.supervisor_name} />
        </div>
      </div>
      <div className="vr-program-side">
        <div className="vr-hours">{formatNumber(p.hours)}</div>
        <div className="vr-hours-unit">ساعة</div>
        <div className="vr-role">{p.role}</div>
      </div>
    </div>
  );
}

export default function VolunteerReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [error, setError] = useState(false);
  const [photoState, setPhotoState] = useState('pending'); // pending | loaded | failed
  const [fontsReady, setFontsReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchParams] = useSearchParams();
  const renderMode = searchParams.get('render') === 'pdf';

  useEffect(() => {
    api.volunteer(id).then(setVolunteer).catch(() => setError(true));
  }, [id]);

  // Also becomes the PDF's document title.
  useEffect(() => {
    if (!volunteer) return;
    const previous = document.title;
    document.title = `ملف المتطوع - ${volunteer.name}`;
    return () => { document.title = previous; };
  }, [volunteer]);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && setFontsReady(true));
    return () => { cancelled = true; };
  }, []);

  // The PDF renderer waits for this, so the photo and web font are never missing from the file.
  const ready = Boolean(volunteer) && fontsReady && (!volunteer.photo || photoState !== 'pending');

  const download = async () => {
    setDownloading(true);
    try {
      await downloadVolunteerPdf(volunteer);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (error || !volunteer) {
    return (
      <div className="vr-root" dir="rtl" lang="ar">
        <style>{styles}</style>
        <p className="vr-loading">{error ? 'تعذر تحميل بيانات المتطوع' : 'جاري تجهيز الملف...'}</p>
      </div>
    );
  }

  const programs = [...volunteer.programs].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const age = ageFrom(volunteer.birth_date);
  const leadCount = programs.filter((p) => p.is_supervisor || p.is_deputy).length;
  const sinceYear = yearOf(volunteer.join_date);
  const tagline = [volunteer.job, volunteer.qualification].filter(Boolean).join(' · ');
  const showPhoto = volunteer.photo && photoState !== 'failed';

  return (
    <div className={`vr-root ${renderMode ? 'vr-render' : ''}`} dir="rtl" lang="ar" data-report-ready={ready ? '' : undefined}>
      <style>{styles}</style>

      {!renderMode && <div className="vr-toolbar">
        <button className="vr-btn" onClick={() => navigate(`/volunteers/${volunteer.id}`)}>
          <ChevronRight size={15} /> العودة للملف
        </button>
        <button className="vr-btn vr-btn-primary" onClick={download} disabled={downloading}>
          {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} تحميل ملف المتطوع
        </button>
      </div>}

      <article className="vr-sheet">
        <header className="vr-header">
          <div className="vr-brand">
            <AinMark className="vr-brand-mark" color={ACCENT_LIGHT} title="شعار عين" />
            <div>
              <div className="vr-brand-name">{ORG_NAME}</div>
              <div className="vr-brand-sub">منصة عين لخدمة المتطوعين</div>
            </div>
          </div>
          <div className="vr-doc">
            <div className="vr-doc-title">ملف متطوع</div>
            <div className="vr-doc-meta">تاريخ الإصدار: {formatDate(todayIso())}</div>
          </div>
        </header>

        <section className="vr-hero">
          {showPhoto ? (
            <img
              className="vr-photo"
              src={volunteer.photo}
              alt={volunteer.name}
              onLoad={() => setPhotoState('loaded')}
              onError={() => setPhotoState('failed')}
            />
          ) : (
            <div className="vr-photo vr-photo-fallback">
              <GenderIcon gender={volunteer.gender} className="h-14 w-14" />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 className="vr-name">{volunteer.name}</h1>
            {tagline && <div className="vr-tagline">{tagline}</div>}
            <div className="vr-badges">
              <span className={`vr-badge ${volunteer.status === 'active' ? 'vr-badge-active' : ''}`}>
                {volunteer.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
              <span className="vr-badge">{volunteer.gender === 'f' ? 'متطوعة' : 'متطوع'}</span>
              {sinceYear && <span className="vr-badge">عضو منذ {sinceYear}</span>}
            </div>
          </div>
        </section>

        <section className="vr-stats">
          <div className="vr-stat">
            <div className="vr-stat-label">إجمالي الساعات</div>
            <div className="vr-stat-value">{formatNumber(volunteer.totalHours)}<span className="vr-stat-unit">ساعة</span></div>
          </div>
          <div className="vr-stat">
            <div className="vr-stat-label">البرامج المشارك بها</div>
            <div className="vr-stat-value">{formatNumber(volunteer.totalPrograms)}</div>
          </div>
          <div className="vr-stat">
            <div className="vr-stat-label">مهام إشرافية</div>
            <div className="vr-stat-value">{formatNumber(leadCount)}</div>
          </div>
          <div className="vr-stat">
            <div className="vr-stat-label">آخر مشاركة</div>
            <div className="vr-stat-value" style={{ fontSize: '12pt' }}>{programs[0]?.date ? formatDate(programs[0].date) : '—'}</div>
          </div>
        </section>

        <section className="vr-section">
          <h2 className="vr-section-title">البيانات الشخصية</h2>
          <div className="vr-fields">
            <Field label="الاسم الكامل" value={volunteer.name} />
            <Field label="رقم الهوية الوطنية" value={volunteer.national_id} ltr />
            <Field label="الجنس" value={volunteer.gender === 'f' ? 'أنثى' : 'ذكر'} />
            <Field
              label="تاريخ الميلاد"
              value={volunteer.birth_date && `${formatDate(volunteer.birth_date)}${age !== null ? ` (${formatNumber(age)} سنة)` : ''}`}
            />
            <Field label="رقم الجوال" value={volunteer.phone} ltr />
            <Field label="البريد الإلكتروني" value={volunteer.email} ltr />
            <Field label="المؤهل العلمي" value={volunteer.qualification} />
            <Field label="الوظيفة" value={volunteer.job} />
            <Field label="تاريخ الانضمام" value={formatDate(volunteer.join_date)} />
          </div>
        </section>

        <section className="vr-section">
          <h2 className="vr-section-title">
            سجل المشاركات في البرامج
            <span className="vr-section-count">({formatNumber(programs.length)})</span>
          </h2>
          {programs.length > 0 ? (
            <div className="vr-programs">
              {programs.map((p, i) => <ProgramItem key={p.participation_id} index={i + 1} program={p} />)}
            </div>
          ) : (
            <div className="vr-empty">لا توجد مشاركات مسجلة</div>
          )}
        </section>

        <footer className="vr-footer">
          <span>{ORG_NAME} — منصة عين</span>
          <span>صدر بتاريخ {formatDate(todayIso())}</span>
        </footer>
      </article>
    </div>
  );
}
