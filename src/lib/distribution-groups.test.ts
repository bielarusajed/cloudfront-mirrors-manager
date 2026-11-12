import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { DistributionSummary } from '../types/distribution.ts';
import { groupDistributions, toggleGroupSelection } from './distribution-groups.ts';

const now = Date.parse('2026-11-12T12:00:00Z');
const item = (id: string, time?: string): DistributionSummary => ({
  id,
  status: 'Deployed',
  enabled: true,
  domainName: `${id}.cloudfront.net`,
  origins: [],
  lastModifiedTime: time,
});

test('recent updates stay together across minute boundaries and ignore enabled state', () => {
  const groups = groupDistributions(
    [
      item('old', '2026-11-11T11:00:00Z'),
      { ...item('disabled', '2026-11-12T11:59:59Z'), enabled: false },
      item('new', '2026-11-12T11:59:00Z'),
    ],
    now,
  );
  assert.deepEqual(
    groups.map((g) => [g.label, g.items.map((d) => d.id)]),
    [
      ['Абноўлена толькі што', ['disabled', 'new']],
      ['Учора', ['old']],
    ],
  );
});

test('five-minute boundary is inclusive for the older daily group', () => {
  assert.deepEqual(
    groupDistributions([item('a', '2026-11-12T11:55:00Z')], now).map((g) => g.label),
    ['Сёння'],
  );
});

test('missing and malformed update dates are unknown, not invented dates', () => {
  const groups = groupDistributions(
    [item('missing'), item('bad', 'invalid'), item('known', '2026-11-12T11:59:00Z')],
    now,
  );
  assert.equal(groups.at(-1)?.label, 'Дата абнаўлення невядомая');
  assert.deepEqual(
    groups.at(-1)?.items.map((d) => d.id),
    ['bad', 'missing'],
  );
});

test('calendar grouping respects local timezone at midnight', () => {
  const midnight = Date.parse('2026-11-12T23:30:00Z');
  const groups = groupDistributions(
    [item('today', '2026-11-12T23:00:00Z'), item('yesterday', '2026-11-12T12:00:00Z')],
    midnight,
    'Europe/Warsaw',
  );
  assert.deepEqual(
    groups.map((g) => g.label),
    ['Сёння', 'Учора'],
  );
});

test('yesterday remains the previous calendar day across daylight saving time', () => {
  const groups = groupDistributions(
    [item('yesterday', '2026-10-24T12:00:00Z')],
    Date.parse('2026-10-25T12:00:00Z'),
    'Europe/Warsaw',
  );
  assert.equal(groups[0].label, 'Учора');
});

test('partial group selection adds the rest and deselect preserves other groups', () => {
  const previous = new Set(['a', 'other']);
  const all = toggleGroupSelection(previous, ['a', 'b']);
  assert.deepEqual([...all], ['a', 'other', 'b']);
  assert.deepEqual([...toggleGroupSelection(all, ['a', 'b'])], ['other']);
  assert.deepEqual([...previous], ['a', 'other']);
});
