// Small deterministic helpers shared across the mock data layer and UI.

/** Mulberry32 seeded PRNG — keeps demo data identical across reloads/resets. */
export function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickMany<T>(rand: () => number, arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

let idCounter = 1000;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter.toString(36)}`;
}

export function resetIdCounter() {
  idCounter = 1000;
}

/** Today, fixed to the app's "current" in-world date for demo consistency. */
export const TODAY = new Date('2026-09-26T09:00:00');

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + 'T00:00:00');
  const to = new Date(toIso + 'T00:00:00');
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export function relativeDeadline(deadlineIso: string): { label: string; urgent: boolean; overdue: boolean } {
  const days = daysBetween(isoDate(TODAY), deadlineIso);
  if (days < 0) return { label: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`, urgent: true, overdue: true };
  if (days === 0) return { label: 'Due today', urgent: true, overdue: false };
  if (days === 1) return { label: 'Due tomorrow', urgent: true, overdue: false };
  if (days <= 3) return { label: `Due in ${days} days`, urgent: true, overdue: false };
  return { label: `Due in ${days} days`, urgent: false, overdue: false };
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function classNames(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ');
}
