function parseDates(row) {
  return { ...row, dates: JSON.parse(row.dates || '[]') };
}

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT pr.*,
      COALESCE(SUM(part.hours), 0) AS total_hours,
      COUNT(DISTINCT part.volunteer_id) AS volunteer_count
    FROM programs pr
    LEFT JOIN participations part ON part.program_id = pr.id
    GROUP BY pr.id
    ORDER BY pr.id DESC
  `).all();
  return Response.json(results.map(parseDates));
}

export async function onRequestPost({ env, request }) {
  const body = await request.json();
  const { name, description, category, executor_name, executor_logo, location, supervisor_name, beneficiaries, date_mode, dates, notes } = body;
  if (!name || !category || !date_mode) {
    return Response.json({ error: 'name, category, date_mode required' }, { status: 400 });
  }

  const resolvedExecutor = category === 'internal' ? 'جمعية العيون التطوعية' : (executor_name ?? null);

  const info = await env.DB.prepare(`
    INSERT INTO programs (name, description, category, executor_name, executor_logo, location, supervisor_name, beneficiaries, date_mode, dates, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    name, description ?? null, category, resolvedExecutor, executor_logo ?? null,
    location ?? null, supervisor_name ?? null, beneficiaries ?? 0, date_mode,
    JSON.stringify(dates ?? []), notes ?? null
  ).run();

  const programId = info.meta.last_row_id;
  const partners = [...new Set((body.partners ?? []).map((n) => String(n).trim()).filter(Boolean))];
  if (partners.length > 0) {
    await env.DB.batch(partners.map((name) =>
      env.DB.prepare(`INSERT INTO program_partners (program_id, name) VALUES (?, ?)`).bind(programId, name)
    ));
  }

  return Response.json({ id: programId }, { status: 201 });
}
