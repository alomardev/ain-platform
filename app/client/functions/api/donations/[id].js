import { normalize } from './index';

export async function onRequestPut({ env, params, request }) {
  const { data, error } = normalize(await request.json());
  if (error) return Response.json({ error }, { status: 400 });

  const res = await env.DB.prepare(`
    UPDATE donations SET program_id = ?, support_type = ?, amount = ?, inkind_item = ?, date = ?
    WHERE id = ?
  `).bind(data.program_id, data.support_type, data.amount, data.inkind_item, data.date, params.id).run();
  if (res.meta.changes === 0) return Response.json({ error: 'not found' }, { status: 404 });

  return Response.json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const res = await env.DB.prepare(`DELETE FROM donations WHERE id = ?`).bind(params.id).run();
  if (res.meta.changes === 0) return Response.json({ error: 'not found' }, { status: 404 });
  return new Response(null, { status: 204 });
}
