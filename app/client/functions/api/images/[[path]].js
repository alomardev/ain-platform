// Serves uploaded images from R2. Keys are never reused (each upload gets a new UUID),
// so responses can be cached forever.
export async function onRequestGet({ env, params, request }) {
  const key = (params.path ?? []).join('/');
  if (!key.startsWith('avatars/') || key.includes('..') || !env.AVATARS) {
    return new Response('Not found', { status: 404 });
  }

  const object = await env.AVATARS.get(key, { onlyIf: request.headers });
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  // onlyIf matched an If-None-Match / If-Modified-Since: object has no body.
  if (!('body' in object)) return new Response(null, { status: 304, headers });
  return new Response(object.body, { headers });
}
