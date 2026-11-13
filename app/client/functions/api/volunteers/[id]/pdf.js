import puppeteer from '@cloudflare/puppeteer';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Browser Rendering caps new browsers per minute (3 on Workers Free), so reuse an idle session when one
// is still alive; sessions are left open on disconnect and shut down after KEEP_ALIVE_MS of inactivity.
const KEEP_ALIVE_MS = 20000;

async function getBrowser(env) {
  const sessions = await puppeteer.sessions(env.BROWSER).catch(() => []);
  for (const session of sessions) {
    if (session.connectionId) continue; // another request is using it
    try {
      return await puppeteer.connect(env.BROWSER, session.sessionId);
    } catch {
      // session closed in the meantime; try the next one or launch
    }
  }
  for (let attempt = 0; ; attempt++) {
    try {
      return await puppeteer.launch(env.BROWSER, { keep_alive: KEEP_ALIVE_MS });
    } catch (err) {
      if (attempt >= 2) throw err;
      await sleep(4000);
    }
  }
}

// Renders the printable profile page (src/pages/VolunteerReport.jsx) in Cloudflare's headless
// Chromium (binding BROWSER) and returns it as a vector A4 PDF download.
export async function onRequestGet({ env, params, request }) {
  const id = params.id;
  const volunteer = await env.DB.prepare(`SELECT name FROM volunteers WHERE id = ?`).bind(id).first();
  if (!volunteer) return Response.json({ error: 'not found' }, { status: 404 });

  const target = new URL(`/volunteers/${id}/profile?render=pdf`, request.url);
  let browser;
  try {
    browser = await getBrowser(env);
  } catch (err) {
    console.error('browser launch failed', err);
    return Response.json({ error: 'خدمة إنشاء الملف مشغولة حالياً، حاول بعد لحظات' }, { status: 503 });
  }
  let page;
  try {
    page = await browser.newPage();
    await page.goto(target.href, { waitUntil: 'networkidle0', timeout: 30000 });
    // Set by the page once data, photo and web font are in.
    await page.waitForSelector('[data-report-ready]', { timeout: 15000 });
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });

    const filename = `ملف المتطوع - ${volunteer.name}.pdf`;
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="volunteer-${id}.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } finally {
    await page?.close().catch(() => {});
    browser.disconnect();
  }
}
