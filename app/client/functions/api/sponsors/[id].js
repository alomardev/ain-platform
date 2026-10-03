export async function onRequestGet({ env, params }) {
  const id = params.id;
  const sponsor = await env.DB.prepare(`SELECT * FROM sponsors WHERE id = ?`).bind(id).first();
  if (!sponsor) return Response.json({ error: 'not found' }, { status: 404 });

  const [donations, totals] = await Promise.all([
    env.DB.prepare(`
      SELECT d.*, pr.name AS program_name
      FROM donations d LEFT JOIN programs pr ON pr.id = d.program_id
      WHERE d.sponsor_id = ?
      ORDER BY d.date DESC
    `).bind(id).all(),
    env.DB.prepare(`
      SELECT COUNT(*) c, COALESCE(SUM(amount),0) a FROM donations WHERE sponsor_id = ?
    `).bind(id).first(),
  ]);

  return Response.json({
    ...sponsor,
    donations: donations.results,
    donationCount: totals.c,
    totalAmount: totals.a,
  });
}

export async function onRequestPut({ env, params, request }) {
  const id = params.id;
  const body = await request.json();
  const fields = ['name', 'logo', 'category', 'since', 'phone', 'email'];
  const updates = fields.filter((f) => f in body);
  if (updates.length === 0) return Response.json({ error: 'no fields to update' }, { status: 400 });

  const setClause = updates.map((f) => `${f} = ?`).join(', ');
  const values = updates.map((f) => body[f]);
  await env.DB.prepare(`UPDATE sponsors SET ${setClause} WHERE id = ?`).bind(...values, id).run();

  return Response.json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const id = params.id;
  const [, , res] = await env.DB.batch([
    env.DB.prepare(`DELETE FROM donations WHERE sponsor_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM program_sponsors WHERE sponsor_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM sponsors WHERE id = ?`).bind(id),
  ]);
  if (res.meta.changes === 0) return Response.json({ error: 'not found' }, { status: 404 });
  return new Response(null, { status: 204 });
}
