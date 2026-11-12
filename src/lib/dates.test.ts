import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calendarDayKey, formatDate, formatDateTime } from './dates.ts';

test('uses Belarusian month names and a 24-hour clock for every month', () => {
  const months = [
    'студзеня',
    'лютага',
    'сакавіка',
    'красавіка',
    'мая',
    'чэрвеня',
    'ліпеня',
    'жніўня',
    'верасня',
    'кастрычніка',
    'лістапада',
    'снежня',
  ];
  for (let month = 0; month < months.length; month++) {
    const date = new Date(Date.UTC(2026, month, 6, 0, 5));
    assert.equal(formatDate(date, 'UTC'), `6 ${months[month]} 2026`);
    assert.equal(formatDateTime(date, 'UTC'), `6 ${months[month]} 2026, 00:05`);
  }
});

test('dates, clock times, and grouping keys agree across local midnight', () => {
  const date = '2026-12-31T23:30:00Z';
  assert.equal(formatDateTime(date, 'Europe/Warsaw'), '1 студзеня 2027, 00:30');
  assert.equal(calendarDayKey(Date.parse(date), 'Europe/Warsaw'), '2027-01-01');
  assert.equal(formatDateTime(date, 'America/New_York'), '31 снежня 2026, 18:30');
});

test('missing and invalid dates have a readable fallback without throwing', () => {
  for (const value of [undefined, null, '', 'invalid', new Date(Number.NaN)]) {
    assert.equal(formatDate(value), 'Няма даных');
    assert.equal(formatDateTime(value), 'Няма даных');
  }
});
