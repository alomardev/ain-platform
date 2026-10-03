import {
  IMAGE_PATH_PREFIX, MAX_UPLOAD_BYTES, MAX_STORED_BYTES, AVATAR_SIZE, deleteAvatar, sniffImageType,
} from '../../../../server/avatars.js';

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Resizes through the ain-image-resizer Worker (Cloudflare Images binding), which Pages can only reach via a
// service binding. Returns null when the resizer isn't reachable (e.g. not started in local dev).
async function resize(env, bytes, type) {
  if (!env.IMAGE_RESIZER) return null;
  try {
    const res = await env.IMAGE_RESIZER.fetch(`https://image-resizer/avatar?size=${AVATAR_SIZE}`, {
      method: 'POST',
      headers: { 'Content-Type': type },
      body: bytes,
    });
    if (!res.ok) throw new Error(`resizer responded ${res.status}`);
    return { bytes: await res.arrayBuffer(), type: res.headers.get('Content-Type') || 'image/webp' };
  } catch (err) {
    console.warn('image resizer unavailable:', err.message);
    return null;
  }
}

// Body: the raw image bytes (Content-Type is ignored; the format is sniffed).
export async function onRequestPut({ env, params, request }) {
  if (!env.AVATARS) return Response.json({ error: 'تخزين الصور غير مهيأ على الخادم' }, { status: 500 });
  const id = params.id;
  const existing = await env.DB.prepare(`SELECT photo FROM volunteers WHERE id = ?`).bind(id).first();
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > MAX_UPLOAD_BYTES) return Response.json({ error: 'حجم الصورة كبير جداً (الحد 10 ميجابايت)' }, { status: 413 });
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return Response.json({ error: 'لم يتم إرسال صورة' }, { status: 400 });
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return Response.json({ error: 'حجم الصورة كبير جداً (الحد 10 ميجابايت)' }, { status: 413 });

  const type = sniffImageType(bytes);
  if (!type) return Response.json({ error: 'صيغة الصورة غير مدعومة، استخدم JPG أو PNG أو WebP' }, { status: 415 });

  // Without the resizer we still accept the image, but only if it is already small enough.
  const out = (await resize(env, bytes, type)) ?? { bytes, type };
  if (out.bytes.byteLength > MAX_STORED_BYTES) {
    return Response.json({ error: 'تعذر ضغط الصورة إلى الحجم المسموح، جرّب صورة أخرى' }, { status: 413 });
  }

  const key = `avatars/${id}-${crypto.randomUUID()}.${EXTENSIONS[out.type] ?? 'webp'}`;
  await env.AVATARS.put(key, out.bytes, { httpMetadata: { contentType: out.type } });
  const photo = `${IMAGE_PATH_PREFIX}${key}`;

  try {
    await env.DB.prepare(`UPDATE volunteers SET photo = ? WHERE id = ?`).bind(photo, id).run();
  } catch (err) {
    await env.AVATARS.delete(key);
    throw err;
  }
  await deleteAvatar(env, existing.photo);

  return Response.json({ photo });
}

export async function onRequestDelete({ env, params }) {
  const id = params.id;
  const existing = await env.DB.prepare(`SELECT photo FROM volunteers WHERE id = ?`).bind(id).first();
  if (!existing) return Response.json({ error: 'not found' }, { status: 404 });

  await env.DB.prepare(`UPDATE volunteers SET photo = NULL WHERE id = ?`).bind(id).run();
  await deleteAvatar(env, existing.photo);
  return new Response(null, { status: 204 });
}
