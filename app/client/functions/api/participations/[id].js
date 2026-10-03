import { checkParticipation, participationErrorResponse } from '../../../server/participations.js';

// Body: { role, hours }. Supervisor/deputy flags are recomputed from the role.
export async function onRequestPut({ env, params, request }) {
  const p = checkParticipation(await request.json());
  if (p.errors) return participationErrorResponse(p.errors);

  const res = await env.DB.prepare(`
    UPDATE participations SET role = ?, hours = ?, is_supervisor = ?, is_deputy = ? WHERE id = ?
  `).bind(p.role, p.hours, p.is_supervisor, p.is_deputy, params.id).run();
  if (res.meta.changes === 0) return Response.json({ error: 'not found' }, { status: 404 });
  return Response.json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const res = await env.DB.prepare(`DELETE FROM participations WHERE id = ?`).bind(params.id).run();
  if (res.meta.changes === 0) return Response.json({ error: 'not found' }, { status: 404 });
  return new Response(null, { status: 204 });
}
