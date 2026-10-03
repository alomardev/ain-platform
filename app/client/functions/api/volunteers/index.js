import { cleanVolunteerInput, validationResponse, conflictResponse } from '../../../server/volunteers.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT v.*,
      COALESCE(SUM(p.hours), 0) AS total_hours,
      COUNT(DISTINCT p.program_id) AS total_programs
    FROM volunteers v
    LEFT JOIN participations p ON p.volunteer_id = v.id
    GROUP BY v.id
    ORDER BY total_hours DESC, total_programs DESC
  `).all();
  return Response.json(results);
}

export async function onRequestPost({ env, request }) {
  const v = cleanVolunteerInput(await request.json());
  const invalid = validationResponse(v);
  if (invalid) return invalid;

  try {
    const info = await env.DB.prepare(`
      INSERT INTO volunteers (name, gender, national_id, birth_date, phone, email, qualification, job, join_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      v.name, v.gender, v.national_id, v.birth_date, v.phone ?? null, v.email ?? null,
      v.qualification ?? null, v.job ?? null, v.join_date ?? null, v.status ?? 'active'
    ).run();
    return Response.json({ id: info.meta.last_row_id }, { status: 201 });
  } catch (err) {
    const conflict = conflictResponse(err);
    if (conflict) return conflict;
    throw err;
  }
}
