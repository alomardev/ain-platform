function parseDates(row) {
  return { ...row, dates: JSON.parse(row.dates || '[]') };
}

function cleanPartners(list) {
  return [...new Set((list ?? []).map((n) => String(n).trim()).filter(Boolean))];
}

export async function onRequestGet({ env, params }) {
  const id = params.id;
  const program = await env.DB.prepare(`SELECT * FROM programs WHERE id = ?`).bind(id).first();
  if (!program) return Response.json({ error: 'not found' }, { status: 404 });

  const [volunteers, sponsors, partners, funding, totals] = await Promise.all([
    env.DB.prepare(`
      SELECT v.id, v.name, v.gender, part.role, part.hours, part.is_supervisor, part.is_deputy
      FROM participations part
      JOIN volunteers v ON v.id = part.volunteer_id
      WHERE part.program_id = ?
      ORDER BY part.is_supervisor DESC, part.is_deputy DESC, part.hours DESC
    `).bind(id).all(),
    env.DB.prepare(`
      SELECT DISTINCT s.id, s.name FROM donations d JOIN sponsors s ON s.id = d.sponsor_id WHERE d.program_id = ? ORDER BY s.name
    `).bind(id).all(),
    env.DB.prepare(`SELECT id, name FROM program_partners WHERE program_id = ?`).bind(id).all(),
    env.DB.prepare(`
      SELECT d.id, d.sponsor_id, d.support_type, d.amount, d.inkind_item, d.date, s.name AS sponsor_name
      FROM donations d JOIN sponsors s ON s.id = d.sponsor_id
      WHERE d.program_id = ?
      ORDER BY d.date DESC
    `).bind(id).all(),
    env.DB.prepare(`
      SELECT COALESCE(SUM(hours),0) hours, COUNT(DISTINCT volunteer_id) volunteers
      FROM participations WHERE program_id = ?
    `).bind(id).first(),
  ]);

  return Response.json({
    ...parseDates(program),
    volunteers: volunteers.results,
    sponsors: sponsors.results,
    partners: partners.results,
    funding: funding.results,
    totalHours: totals.hours,
    totalVolunteers: totals.volunteers,
  });
}

export async function onRequestPut({ env, params, request }) {
  const id = params.id;
  const body = await request.json();
  const fields = ['name', 'description', 'category', 'executor_name', 'executor_logo', 'location', 'supervisor_name', 'beneficiaries', 'date_mode', 'notes', 'logo', 'status'];
  const patch = { ...body };
  if ('dates' in patch) patch.dates = JSON.stringify(patch.dates);
  if (patch.category === 'internal') patch.executor_name = 'جمعية العيون التطوعية';

  const updates = fields.concat('dates' in body ? ['dates'] : []).filter((f) => f in patch);
  const hasPartners = Array.isArray(body.partners);
  if (updates.length === 0 && !hasPartners) return Response.json({ error: 'no fields to update' }, { status: 400 });

  const statements = [];
  if (updates.length > 0) {
    const setClause = updates.map((f) => `${f} = ?`).join(', ');
    const values = updates.map((f) => patch[f]);
    statements.push(env.DB.prepare(`UPDATE programs SET ${setClause} WHERE id = ?`).bind(...values, id));
  }
  if (hasPartners) {
    statements.push(env.DB.prepare(`DELETE FROM program_partners WHERE program_id = ?`).bind(id));
    for (const name of cleanPartners(body.partners)) {
      statements.push(env.DB.prepare(`INSERT INTO program_partners (program_id, name) VALUES (?, ?)`).bind(id, name));
    }
  }
  await env.DB.batch(statements);

  return Response.json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const id = params.id;
  const [, , , , res] = await env.DB.batch([
    env.DB.prepare(`DELETE FROM participations WHERE program_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM program_sponsors WHERE program_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM program_partners WHERE program_id = ?`).bind(id),
    env.DB.prepare(`UPDATE donations SET program_id = NULL WHERE program_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM programs WHERE id = ?`).bind(id),
  ]);
  if (res.meta.changes === 0) return Response.json({ error: 'not found' }, { status: 404 });
  return new Response(null, { status: 204 });
}
