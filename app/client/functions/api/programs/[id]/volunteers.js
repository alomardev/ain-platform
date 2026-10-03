import { checkParticipation, participationErrorResponse } from '../../../../server/participations.js';

const MAX_MEMBERS = 200;

// Adds one or more volunteers to a program.
// Body: { members: [{ volunteer_id, role, hours }] }. Volunteers already in the program are skipped.
export async function onRequestPost({ env, params, request }) {
  const programId = params.id;
  const { members } = await request.json();
  if (!Array.isArray(members) || members.length === 0) {
    return Response.json({ error: 'اختر متطوعاً واحداً على الأقل' }, { status: 400 });
  }
  if (members.length > MAX_MEMBERS) {
    return Response.json({ error: `لا يمكن إضافة أكثر من ${MAX_MEMBERS} متطوع دفعة واحدة` }, { status: 400 });
  }

  const program = await env.DB.prepare(`SELECT dates FROM programs WHERE id = ?`).bind(programId).first();
  if (!program) return Response.json({ error: 'not found' }, { status: 404 });
  // Participation date defaults to the program's first day.
  const date = [...JSON.parse(program.dates || '[]')].sort()[0] ?? null;

  const rows = [];
  const seen = new Set();
  for (const [index, m] of members.entries()) {
    const volunteerId = Number(m?.volunteer_id);
    if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
      return Response.json({ error: 'volunteer_id غير صحيح', index }, { status: 400 });
    }
    const p = checkParticipation(m);
    if (p.errors) return participationErrorResponse(p.errors, { index, volunteer_id: volunteerId });
    if (seen.has(volunteerId)) continue;
    seen.add(volunteerId);
    rows.push({ volunteerId, ...p });
  }

  // INSERT ... SELECT so unknown volunteers and existing members are skipped instead of failing the batch.
  const results = await env.DB.batch(rows.map((r) => env.DB.prepare(`
    INSERT INTO participations (volunteer_id, program_id, role, hours, is_supervisor, is_deputy, date)
    SELECT v.id, ?, ?, ?, ?, ?, ? FROM volunteers v
    WHERE v.id = ?
      AND NOT EXISTS (SELECT 1 FROM participations WHERE volunteer_id = v.id AND program_id = ?)
  `).bind(programId, r.role, r.hours, r.is_supervisor, r.is_deputy, date, r.volunteerId, programId)));

  const added = results.reduce((n, res) => n + res.meta.changes, 0);
  return Response.json({ added, skipped: rows.length - added }, { status: 201 });
}
