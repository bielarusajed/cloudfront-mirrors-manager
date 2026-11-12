'use client';
import { Check, Copy, X } from 'lucide-react';

export function SelectionIsland({
  count,
  copied,
  onCopy,
  onClear,
}: { count: number; copied: boolean; onCopy: () => void; onClear: () => void }) {
  if (!count) return null;
  return (
    <section className="mirror-selection" aria-label="Дзеянні з выбранымі люстэркамі">
      <output className="mirror-selection-count">
        <span>Выбрана</span>
        <strong>{count}</strong>
      </output>
      <button type="button" className="mirror-button mirror-button-primary mirror-copy-selected" onClick={onCopy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Скапіявана' : 'Скапіяваць URL'}
      </button>
      <button
        type="button"
        className="mirror-clear-selection"
        aria-label="Зняць увесь выбар"
        title="Зняць увесь выбар"
        onClick={onClear}
      >
        <X size={18} />
      </button>
    </section>
  );
}
