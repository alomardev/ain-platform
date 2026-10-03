export async function onRequestGet({ env }) {
  const db = env.DB;
  const [volunteers, programs, hours, beneficiaries] = await Promise.all([
    db.prepare(`SELECT COUNT(*) c FROM volunteers`).first('c'),
    db.prepare(`SELECT COUNT(*) c FROM programs`).first('c'),
    db.prepare(`SELECT COALESCE(SUM(hours),0) h FROM participations`).first('h'),
    db.prepare(`SELECT COALESCE(SUM(beneficiaries),0) b FROM programs`).first('b'),
  ]);
  return Response.json({ volunteers, programs, hours, beneficiaries });
}
