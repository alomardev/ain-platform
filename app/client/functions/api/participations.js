export async function onRequestPost({ env, request }) {
  const body = await request.json();
  const { volunteer_id, program_id, role, hours, is_supervisor, is_deputy, date } = body;
  if (!volunteer_id || !program_id || !role) {
    return Response.json({ error: 'volunteer_id, program_id, role required' }, { status: 400 });
  }

  const info = await env.DB.prepare(`
    INSERT INTO participations (volunteer_id, program_id, role, hours, is_supervisor, is_deputy, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(volunteer_id, program_id, role, hours ?? 0, is_supervisor ? 1 : 0, is_deputy ? 1 : 0, date ?? null).run();

  return Response.json({ id: info.meta.last_row_id }, { status: 201 });
}
