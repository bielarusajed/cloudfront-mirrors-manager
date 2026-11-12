'use client';

import { X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef } from 'react';

export function WorkspaceDialog({
  title,
  children,
  onClose,
  busy = false,
}: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="mirror-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && busy) event.preventDefault();
      }}
    >
      <header className="mirror-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Закрыць акно">
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
