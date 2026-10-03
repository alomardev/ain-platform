const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `${res.status} ${res.statusText}`);
    err.fields = body.errors ?? {};
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  dashboard: () => request('/dashboard'),

  volunteers: () => request('/volunteers'),
  volunteer: (id) => request(`/volunteers/${id}`),
  createVolunteer: (data) => request('/volunteers', { method: 'POST', body: JSON.stringify(data) }),
  updateVolunteer: (id, data) => request(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVolunteer: (id) => request(`/volunteers/${id}`, { method: 'DELETE' }),
  uploadVolunteerPhoto: (id, blob) =>
    request(`/volunteers/${id}/photo`, { method: 'PUT', headers: { 'Content-Type': blob.type }, body: blob }),
  deleteVolunteerPhoto: (id) => request(`/volunteers/${id}/photo`, { method: 'DELETE' }),

  programs: () => request('/programs'),
  program: (id) => request(`/programs/${id}`),
  createProgram: (data) => request('/programs', { method: 'POST', body: JSON.stringify(data) }),
  updateProgram: (id, data) => request(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgram: (id) => request(`/programs/${id}`, { method: 'DELETE' }),

  sponsors: () => request('/sponsors'),
  sponsor: (id) => request(`/sponsors/${id}`),
  createSponsor: (data) => request('/sponsors', { method: 'POST', body: JSON.stringify(data) }),
  updateSponsor: (id, data) => request(`/sponsors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSponsor: (id) => request(`/sponsors/${id}`, { method: 'DELETE' }),

  createDonation: (data) => request('/donations', { method: 'POST', body: JSON.stringify(data) }),
  updateDonation: (id, data) => request(`/donations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDonation: (id) => request(`/donations/${id}`, { method: 'DELETE' }),
  createParticipation: (data) => request('/participations', { method: 'POST', body: JSON.stringify(data) }),
  updateParticipation: (id, data) => request(`/participations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteParticipation: (id) => request(`/participations/${id}`, { method: 'DELETE' }),
  addProgramVolunteers: (programId, members) =>
    request(`/programs/${programId}/volunteers`, { method: 'POST', body: JSON.stringify({ members }) }),
};
