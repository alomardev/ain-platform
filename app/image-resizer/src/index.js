// Square-crops and re-encodes an uploaded image as WebP using the Cloudflare Images binding.
// Called by the Pages project (functions/api/volunteers/[id]/photo.js) through a service binding.
const MAX_SIZE = 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/avatar') {
      return new Response('Not found', { status: 404 });
    }
    const size = Math.min(Number(url.searchParams.get('size')) || 512, MAX_SIZE);

    try {
      const result = await env.IMAGES.input(request.body)
        .transform({ width: size, height: size, fit: 'cover', gravity: 'auto' })
        .output({ format: 'image/webp', quality: 80 });
      return result.response();
    } catch (err) {
      return new Response(`Could not process image: ${err.message}`, { status: 422 });
    }
  },
};
