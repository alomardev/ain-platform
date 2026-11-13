import { cleanVolunteerInput, validationResponse, conflictResponse } from '../../../server/volunteers.js';
import { deleteAvatar } from '../../../server/avatars.js';

export async function onRequestGet({ env, params }) {
  const id = params.id;
  const volunteer = await env.DB.prepare(`SELECT * FROM volunteers WHERE id = ?`).bind(id).first();
  if (!volunteer) return Response.json({ error: 'not found' }, { status: 404 });

  const { results: programs } = await env.DB.prepare(`
    SELECT pr.id, pr.name, pr.date_mode, pr.dates, pr.category, pr.description, pr.location,
           pr.executor_name, pr.supervisor_name, pr.beneficiaries, part.id AS participation_id, part.role, part.hours, part.date,
           part.is_supervisor, part.is_deputy
    FROM participations part
    JOIN programs pr ON pr.id = part.program_id
    WHERE part.volunteer_id = ?
    ORDER BY part.date DESC
  `).bind(id).all();

  const totals = await env.DB.prepare(`
    SELECT COALESCE(SUM(hours),0) hours, COUNT(DISTINCT program_id) programs
    FROM participations WHERE volunteer_id = ?
  `).bind(id).first();

  return Response.json({
    ...volunteer,
    programs: programs.map((p) => ({ ...p, dates: JSON.parse(p.dates || '[]') })),
    totalHours: totals.hours,
    totalPrograms: totals.programs,
  });
}

// `photo` is deliberately not editable here; it changes only through ./[id]/photo.js.
export async function onRequestPut({ env, params, request }) {
  const id = params.id;
  const patch = cleanVolunteerInput(await request.json());
  const updates = Object.keys(patch);
  if (updates.length === 0) return Response.json({ error: 'no fields to update' }, { status: 400 });

  const existing = await env.DB.prepare(`SELECT * FROM volunteers WHERE id = ?`).bind(id).first();
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
  // Validate the merged record so a partial update can't blank out a required field.
  const invalid = validationResponse({ ...existing, ...patch });
  if (invalid) return invalid;

  const setClause = updates.map((f) => `${f} = ?`).join(', ');
  const values = updates.map((f) => patch[f]);
  try {
    await env.DB.prepare(`UPDATE volunteers SET ${setClause} WHERE id = ?`).bind(...values, id).run();
  } catch (err) {
    const conflict = conflictResponse(err);
    if (conflict) return conflict;
    throw err;
  }

  return Response.json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const id = params.id;
  const existing = await env.DB.prepare(`SELECT photo FROM volunteers WHERE id = ?`).bind(id).first();
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  await env.DB.batch([
    env.DB.prepare(`DELETE FROM participations WHERE volunteer_id = ?`).bind(id),
    env.DB.prepare(`DELETE FROM volunteers WHERE id = ?`).bind(id),
  ]);
  await deleteAvatar(env, existing.photo);
  return new Response(null, { status: 204 });
}
