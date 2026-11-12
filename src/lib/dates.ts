type DateValue = Date | string | number | null | undefined;

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

function dateParts(date: Date, timeZone?: string) {
  // Some mobile devices lack Belarusian ICU data and display placeholder month names.
  // Ask only for numeric calendar parts, then use the app's Belarusian vocabulary.
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function calendarDayKey(time: number, timeZone: string): string {
  const { year, month, day } = dateParts(new Date(time), timeZone);
  return `${year}-${month}-${day}`;
}

function displayDate(value: DateValue, timeZone: string | undefined, includeTime: boolean): string {
  if (value === null || value === undefined || value === '') return 'Няма даных';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Няма даных';
  const { year, month, day, hour, minute } = dateParts(date, timeZone);
  const label = `${Number(day)} ${months[Number(month) - 1]} ${year}`;
  return includeTime ? `${label}, ${hour}:${minute}` : label;
}

export function formatDate(value: DateValue, timeZone?: string): string {
  return displayDate(value, timeZone, false);
}

export function formatDateTime(value: DateValue, timeZone?: string): string {
  return displayDate(value, timeZone, true);
}
