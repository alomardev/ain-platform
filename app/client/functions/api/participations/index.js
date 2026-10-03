import { checkParticipation, participationErrorResponse } from '../../../server/participations.js';

export async function onRequestPost({ env, request }) {
  const body = await request.json();
  const { volunteer_id, program_id, date } = body;
  if (!volunteer_id || !program_id) {
    return Response.json({ error: 'volunteer_id, program_id required' }, { status: 400 });
  }
  const p = checkParticipation(body);
  if (p.errors) return participationErrorResponse(p.errors);

  try {
    const info = await env.DB.prepare(`
      INSERT INTO participations (volunteer_id, program_id, role, hours, is_supervisor, is_deputy, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(volunteer_id, program_id, p.role, p.hours, p.is_supervisor, p.is_deputy, date ?? null).run();
    return Response.json({ id: info.meta.last_row_id }, { status: 201 });
  } catch (err) {
    if (String(err?.message).includes('UNIQUE constraint failed')) {
      return Response.json({ error: 'المتطوع مسجل في هذا البرنامج مسبقاً' }, { status: 409 });
    }
    throw err;
  }
}
