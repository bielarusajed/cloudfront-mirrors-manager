import type { DistributionSummary } from '../types/distribution';
import { calendarDayKey, formatDate } from './dates.ts';

export type DistributionGroup = { key: string; label: string; items: DistributionSummary[] };

export function modifiedTime(item: DistributionSummary): number {
  if (!item.lastModifiedTime) return 0;
  const time = new Date(item.lastModifiedTime).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function groupDistributions(items: DistributionSummary[], now: number, timeZone = 'UTC'): DistributionGroup[] {
  const dayKey = (time: number) => calendarDayKey(time, timeZone);
  const today = dayKey(now);
  const [year, month, date] = today.split('-').map(Number);
  const yesterday = new Date(Date.UTC(year, month - 1, date - 1)).toISOString().slice(0, 10);
  const groups = new Map<string, DistributionGroup>();
  for (const item of [...items].sort((a, b) => modifiedTime(b) - modifiedTime(a) || a.id.localeCompare(b.id))) {
    const time = modifiedTime(item);
    const key = !time ? 'unknown' : now - time >= -60_000 && now - time < 300_000 ? 'recent' : dayKey(time);
    const label =
      key === 'unknown'
        ? 'Дата абнаўлення невядомая'
        : key === 'recent'
          ? 'Абноўлена толькі што'
          : key === today
            ? 'Сёння'
            : key === yesterday
              ? 'Учора'
              : formatDate(time, timeZone);
    const group = groups.get(key);
    if (group) group.items.push(item);
    else groups.set(key, { key, label, items: [item] });
  }
  return [...groups.values()];
}

export function toggleGroupSelection(selected: ReadonlySet<string>, ids: string[]): Set<string> {
  const next = new Set(selected);
  const all = ids.every((id) => next.has(id));
  for (const id of ids) {
    if (all) next.delete(id);
    else next.add(id);
  }
  return next;
}
