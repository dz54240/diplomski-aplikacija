export function relativeTimeHr(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const min = Math.floor((now - then) / 60_000);
  if (min < 1) return 'upravo';
  if (min < 60) return `prije ${min} min`;

  const h = Math.floor(min / 60);
  if (h < 24) return `prije ${h} h`;

  const d = Math.floor(h / 24);
  if (d === 1) return 'jučer';
  if (d < 7) return `prije ${d} dana`;

  return new Date(iso).toLocaleDateString('hr-HR');
}
