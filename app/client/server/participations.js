import { roleFlags, validateParticipation } from '../shared/participation.js';

// Normalizes { role, hours } from a request body; hours may arrive as a string.
export function cleanParticipation(body) {
  const role = typeof body?.role === 'string' ? body.role.trim() : body?.role;
  const raw = body?.hours;
  const hours = raw === '' || raw === null || raw === undefined ? null : Number(raw);
  return { role, hours };
}

// Returns { role, hours, is_supervisor, is_deputy } or { errors }.
export function checkParticipation(body) {
  const p = cleanParticipation(body);
  const errors = validateParticipation(p);
  if (Object.keys(errors).length > 0) return { errors };
  return { ...p, ...roleFlags(p.role) };
}

export function participationErrorResponse(errors, extra = {}) {
  return Response.json({ error: Object.values(errors)[0], errors, ...extra }, { status: 400 });
}
