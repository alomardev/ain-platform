// Validates and normalizes a donation payload. Returns { data } or { error }.
export function normalize(body) {
  const { program_id, support_type, amount, inkind_item, date } = body;
  if (!['cash', 'inkind'].includes(support_type)) return { error: "support_type must be 'cash' or 'inkind'" };
  const num = Number(amount ?? 0);
  if (!Number.isFinite(num) || num < 0) return { error: 'amount must be a non-negative number' };
  if (!date) return { error: 'date required' };
  const item = support_type === 'inkind' ? String(inkind_item ?? '').trim() : '';
  if (support_type === 'inkind' && !item) return { error: 'inkind_item required for inkind support' };
  return {
    data: {
      program_id: program_id ? Number(program_id) : null,
      support_type,
      amount: num,
      inkind_item: item || null,
      date,
    },
  };
}

export async function onRequestPost({ env, request }) {
  const body = await request.json();
  if (!body.sponsor_id) return Response.json({ error: 'sponsor_id required' }, { status: 400 });
  const { data, error } = normalize(body);
  if (error) return Response.json({ error }, { status: 400 });

  const info = await env.DB.prepare(`
    INSERT INTO donations (sponsor_id, program_id, support_type, amount, inkind_item, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(body.sponsor_id, data.program_id, data.support_type, data.amount, data.inkind_item, data.date).run();

  return Response.json({ id: info.meta.last_row_id }, { status: 201 });
}
