import { normalizeNationalId, validateVolunteer } from '../shared/volunteer.js';

const TEXT_FIELDS = ['name', 'gender', 'national_id', 'birth_date', 'phone', 'email', 'qualification', 'job', 'join_date', 'status'];

// Picks known fields from a request body, trims strings and turns blanks into NULL.
export function cleanVolunteerInput(body) {
  const out = {};
  for (const f of TEXT_FIELDS) {
    if (!(f in body)) continue;
    const v = typeof body[f] === 'string' ? body[f].trim() : body[f];
    out[f] = v === '' || v === undefined ? null : v;
  }
  if (out.national_id) out.national_id = normalizeNationalId(out.national_id);
  return out;
}

export function validationResponse(volunteer) {
  const errors = validateVolunteer(volunteer);
  if (Object.keys(errors).length === 0) return null;
  return Response.json({ error: Object.values(errors)[0], errors }, { status: 400 });
}

// D1 surfaces SQLite constraint failures as plain error messages.
export function conflictResponse(err) {
  if (String(err?.message).includes('UNIQUE constraint failed: volunteers.national_id')) {
    return Response.json(
      { error: 'رقم الهوية الوطنية مسجل لمتطوع آخر', errors: { national_id: 'رقم الهوية الوطنية مسجل لمتطوع آخر' } },
      { status: 409 }
    );
  }
  return null;
}
