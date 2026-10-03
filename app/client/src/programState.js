// A program's state is derived from its dates (the stored `status` column is not maintained).

function localTodayIso() {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the user's timezone
}

export function programSpan(program) {
  const dates = (program.dates ?? []).filter(Boolean).sort();
  return { start: dates[0] ?? null, end: dates[dates.length - 1] ?? null };
}

export function programState(program, today = localTodayIso()) {
  const { start, end } = programSpan(program);
  if (!start) return 'undated';
  if (end < today) return 'finished';
  if (start > today) return 'upcoming';
  return 'ongoing';
}

const GROUPS = [
  { key: 'ongoing', label: 'جارية الآن', order: (a, b) => a.start.localeCompare(b.start) },
  { key: 'upcoming', label: 'قادمة', order: (a, b) => a.start.localeCompare(b.start) }, // soonest first
  { key: 'finished', label: 'منتهية', order: (a, b) => b.end.localeCompare(a.end) }, // most recent first
  { key: 'undated', label: 'بدون تاريخ', order: () => 0 },
];

// [{ key, label, items }] in display order, empty groups dropped.
export function groupProgramsByState(programs) {
  const today = localTodayIso();
  const withSpan = programs.map((p) => ({ program: p, state: programState(p, today), ...programSpan(p) }));
  return GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    items: withSpan.filter((x) => x.state === g.key).sort(g.order).map((x) => x.program),
  })).filter((g) => g.items.length > 0);
}
