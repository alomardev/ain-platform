export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT s.*,
      COUNT(DISTINCT d.id) AS donation_count,
      COALESCE(SUM(d.amount), 0) AS total_amount,
      COUNT(DISTINCT d.program_id) AS program_count
    FROM sponsors s
    LEFT JOIN donations d ON d.sponsor_id = s.id
    GROUP BY s.id
    ORDER BY donation_count DESC
  `).all();
  return Response.json(results);
}

export async function onRequestPost({ env, request }) {
  const body = await request.json();
  const { name, logo, category, since, phone, email } = body;
  if (!name || !category) return Response.json({ error: 'name and category required' }, { status: 400 });

  const info = await env.DB.prepare(`
    INSERT INTO sponsors (name, logo, category, since, phone, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(name, logo ?? null, category, since ?? null, phone ?? null, email ?? null).run();

  return Response.json({ id: info.meta.last_row_id }, { status: 201 });
}
