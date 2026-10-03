export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-US');
}

export function yearOf(iso) {
  return iso ? iso.split('-')[0] : '';
}
