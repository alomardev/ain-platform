// Center-crops an image file to a square and downscales it in the browser before upload,
// so phone photos (often 5-12 MB) upload as ~50-100 KB. The server resizes again regardless.
export async function resizeToSquare(file, size = 512, quality = 0.85) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const side = Math.min(bitmap.width, bitmap.height);
  const target = Math.min(size, side);
  const canvas = document.createElement('canvas');
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff'; // JPEG has no alpha; flatten transparent PNGs onto white
  ctx.fillRect(0, 0, target, target);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, target, target);
  bitmap.close();
  // JPEG rather than WebP: Safari's canvas cannot encode WebP. The server converts to WebP.
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))), 'image/jpeg', quality);
  });
}
