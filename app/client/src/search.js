import Fuse from 'fuse.js';
import { toAsciiDigits } from '../shared/volunteer.js';

// Folds Arabic spelling variants so "احمد" finds "أحمد" and "مكه" finds "مكة".
export function normalizeArabic(value) {
  if (Array.isArray(value)) return value.map(normalizeArabic);
  return toAsciiDigits(value ?? '')
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '') // diacritics + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

// Typo-tolerant search over `keys`; returns items best match first, or all items for an empty query.
export function fuzzyFilter(items, query, keys) {
  const q = normalizeArabic(query).trim();
  if (!q) return items;
  // Phone / ID lookups: digits must match exactly, typo tolerance would match every similar number.
  if (/^\d+$/.test(q)) {
    return items.filter((item) => keys.some((k) => toAsciiDigits(item[k] ?? '').includes(q)));
  }
  const fuse = new Fuse(items, {
    keys,
    threshold: 0.35,
    ignoreLocation: true,
    getFn: (obj, path) => normalizeArabic(Fuse.config.getFn(obj, path)),
  });
  return fuse.search(q).map((r) => r.item);
}
