// Avatars live in R2 (binding AVATARS) and are served by functions/api/images/[[path]].js.
// volunteers.photo stores the public path, e.g. /api/images/avatars/12-<uuid>.webp

export const IMAGE_PATH_PREFIX = '/api/images/';
export const AVATAR_SIZE = 512;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // raw upload, before resizing
export const MAX_STORED_BYTES = 300 * 1024; // what may end up in R2

export function avatarKeyFromPhoto(photo) {
  if (typeof photo !== 'string' || !photo.startsWith(`${IMAGE_PATH_PREFIX}avatars/`)) return null;
  return photo.slice(IMAGE_PATH_PREFIX.length);
}

export async function deleteAvatar(env, photo) {
  const key = avatarKeyFromPhoto(photo);
  if (key && env.AVATARS) await env.AVATARS.delete(key);
}

// Identify the real format from magic bytes instead of trusting Content-Type.
export function sniffImageType(bytes) {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  const ascii = String.fromCharCode(...b);
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  return null;
}
