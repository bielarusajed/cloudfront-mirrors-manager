'use client';

import { signOut } from '@/app/actions';
import { CheckAllAvailabilityButton } from '@/components/CheckAllAvailabilityButton';
import { CreateDistributionDialog } from '@/components/CreateDistributionDialog';
import { MirrorCard } from '@/components/MirrorCard';
import { MirrorDetailsDialog } from '@/components/MirrorDetailsDialog';
import { SelectionIsland } from '@/components/SelectionIsland';
import { WorkspaceDialog } from '@/components/WorkspaceDialog';
import { fetchDistributions } from '@/lib/api';
import { groupDistributions, toggleGroupSelection } from '@/lib/distribution-groups';
import type { CreateDistributionBatchResponse, DistributionSummary } from '@/types/distribution';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, LogOut, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import './mirrors.css';

function GroupCheckbox({
  ids,
  label,
  selected,
  onToggle,
}: { ids: string[]; label: string; selected: Set<string>; onToggle: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const count = ids.filter((id) => selected.has(id)).length;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = count > 0 && count < ids.length;
  }, [count, ids.length]);
  return (
    <label className="mirror-group-select">
      <input
        ref={ref}
        type="checkbox"
        checked={count > 0 && count === ids.length}
        onChange={onToggle}
        aria-label={`Выбраць усю групу: ${ids.length}. ${label}`}
      />
      <span className="mirror-group-title">{label}</span>
      <span className="mirror-group-count">{count ? `${count}/${ids.length}` : ids.length}</span>
    </label>
  );
}

export function MirrorsWorkspace({ initialNow }: { initialNow: number }) {
  const client = useQueryClient();
  // Keep confirmed create responses visible while ListDistributions catches up.
  const [created, setCreated] = useState<DistributionSummary[]>([]);
  const [updates, setUpdates] = useState<Record<string, Partial<DistributionSummary>>>({});
  const [removed, setRemoved] = useState(new Set<string>());
  const query = useQuery({
    queryKey: ['distributions'],
    queryFn: fetchDistributions,
    refetchInterval: (q) =>
      created.length ||
      Object.keys(updates).length ||
      removed.size ||
      q.state.data?.items.some((d) => ['InProgress', 'Creating', 'Deleting'].includes(d.status))
        ? 5000
        : false,
  });
  const [selection, setSelection] = useState(new Set<string>());
  const [creating, setCreating] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [manualCopy, setManualCopy] = useState('');
  const [now, setNow] = useState(initialNow);
  const [timeZone, setTimeZone] = useState('UTC');
  const createButton = useRef<HTMLButtonElement>(null);
  const fetched = query.data?.items;
  useEffect(() => {
    if (!fetched) return;
    setCreated((previous) => {
      const next = previous.filter((d) => !fetched.some((f) => f.id === d.id));
      return next.length === previous.length ? previous : next;
    });
  }, [fetched]);
  useEffect(() => {
    if (!fetched || (!Object.keys(updates).length && !removed.size)) return;
    setUpdates((previous) => {
      const entries = Object.entries(previous).filter(([id, patch]) => {
        const actual = fetched.find((d) => d.id === id);
        return (
          !actual ||
          Object.entries(patch).some(
            ([key, value]) =>
              key !== 'status' && key !== 'lastModifiedTime' && actual[key as keyof DistributionSummary] !== value,
          )
        );
      });
      return entries.length === Object.keys(previous).length ? previous : Object.fromEntries(entries);
    });
    setRemoved((previous) => {
      const next = new Set([...previous].filter((id) => fetched.some((d) => d.id === id)));
      return next.size === previous.size ? previous : next;
    });
  }, [fetched, updates, removed]);
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const items = [...created.filter((d) => !fetched?.some((f) => f.id === d.id)), ...(fetched ?? [])]
    .filter((d) => !removed.has(d.id))
    .map((d) => (updates[d.id] ? { ...d, ...updates[d.id] } : d));
  const selected = new Set(items.filter((d) => selection.has(d.id)).map((d) => d.id));
  const inspected = items.find((d) => d.id === inspecting);
  const groups = groupDistributions(items, now, timeZone);
  async function copyUrls(ids: string[], key: string) {
    const matches = items.filter((d) => ids.includes(d.id));
    if (!matches.length) return;
    if (matches.some((d) => !d.domainName)) {
      toast.error('Дамен яшчэ рыхтуецца. Пачакайце абнаўлення спісу.');
      return;
    }
    const urls = matches.map((d) => `https://${d.domainName}`).join('\n');
    try {
      await navigator.clipboard.writeText(urls);
      setCopied(key);
      toast.success(`Скапіявана URL: ${matches.length}.`);
    } catch {
      setManualCopy(urls);
    }
  }
  function onCreated(result: CreateDistributionBatchResponse) {
    setCreated((previous) => [...result.items, ...previous]);
    setSelection(new Set());
    setNow(Date.now());
    client.invalidateQueries({ queryKey: ['distributions'] });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (result.errors.length)
      toast.warning(`Створана люстэркаў: ${result.items.length}. Не ўдалося стварыць: ${result.errors.length}.`, {
        description: result.errors[0].message,
        duration: 12000,
        action: { label: 'Выбраць створаныя', onClick: () => setSelection(new Set(result.items.map((d) => d.id))) },
      });
    else
      toast.success(`Створана люстэркаў: ${result.items.length}.`, {
        duration: 10000,
        action: { label: 'Выбраць створаныя', onClick: () => setSelection(new Set(result.items.map((d) => d.id))) },
      });
  }
  function updateItem(id: string, patch: Partial<DistributionSummary>) {
    setCreated((previous) => previous.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    setUpdates((previous) => ({ ...previous, [id]: patch }));
    const item = items.find((d) => d.id === id);
    if (item) client.resetQueries({ queryKey: ['availability', item.domainName], exact: true });
    setNow(Date.now());
    client.invalidateQueries({ queryKey: ['distributions'] });
  }
  function onDeleted(id: string) {
    setCreated((previous) => previous.filter((d) => d.id !== id));
    setSelection((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
    setRemoved((previous) => new Set([...previous, id]));
    setInspecting(null);
    client.invalidateQueries({ queryKey: ['distributions'] });
  }
  return (
    <main className="mirrors-workspace">
      <header className="mirrors-header">
        <div className="mirrors-heading">
          <h1 className="mirrors-title">
            Люстэркі <span>{items.length}</span>
          </h1>
          <button
            type="button"
            className="mirror-icon mirror-signout"
            title="Выйсці"
            aria-label="Выйсці"
            onClick={() => signOut()}
          >
            <LogOut size={16} />
          </button>
        </div>
        <div className="mirrors-actions">
          <CheckAllAvailabilityButton distributions={items} />
          <button ref={createButton} type="button" className="mirror-button" onClick={() => setCreating(true)}>
            <Plus size={15} />
            Стварыць
          </button>
        </div>
      </header>
      {query.isPending && !items.length && (
        <p className="mirror-loading">
          <LoaderCircle size={18} className="mirror-spinner" />
          Загрузка люстэркаў…
        </p>
      )}
      {query.error && (
        <div className="mirror-list-error" role="alert">
          Не атрымалася абнавіць спіс.{' '}
          <button type="button" onClick={() => query.refetch()}>
            Паўтарыць
          </button>
        </div>
      )}
      {!query.isPending && !query.error && !items.length && (
        <p className="mirror-empty">
          Люстэркаў пакуль няма.{' '}
          <button type="button" onClick={() => setCreating(true)}>
            Стварыць люстэркі
          </button>
        </p>
      )}
      {groups.map((group) => (
        <section key={group.key} className="mirror-group" aria-label={group.label}>
          <GroupCheckbox
            ids={group.items.map((d) => d.id)}
            label={group.label}
            selected={selected}
            onToggle={() =>
              setSelection((previous) =>
                toggleGroupSelection(
                  previous,
                  group.items.map((d) => d.id),
                ),
              )
            }
          />
          <ul className="mirror-grid">
            {group.items.map((item) => (
              <MirrorCard
                key={item.id}
                distribution={item}
                selected={selected.has(item.id)}
                onToggle={() => setSelection((previous) => toggleGroupSelection(previous, [item.id]))}
                onCopy={() => copyUrls([item.id], item.id)}
                onInspect={() => setInspecting(item.id)}
                copied={copied === item.id}
              />
            ))}
          </ul>
        </section>
      ))}
      <SelectionIsland
        count={selected.size}
        copied={copied === 'selection'}
        onCopy={() => copyUrls([...selected], 'selection')}
        onClear={() => {
          setSelection(new Set());
          setCopied(null);
          createButton.current?.focus({ preventScroll: true });
        }}
      />
      {creating && <CreateDistributionDialog onClose={() => setCreating(false)} onCreated={onCreated} />}
      {inspected && (
        <MirrorDetailsDialog
          key={inspected.id}
          distribution={inspected}
          onClose={() => setInspecting(null)}
          onUpdated={(patch) => updateItem(inspected.id, patch)}
          onDeleted={() => onDeleted(inspected.id)}
          onCopy={() => copyUrls([inspected.id], inspected.id)}
        />
      )}
      {manualCopy && (
        <WorkspaceDialog title="Скапіяваць URL" onClose={() => setManualCopy('')}>
          <div className="mirror-manual-copy">
            <p>Буфер абмену недаступны. Вылучыце і скапіруйце гэтыя URL.</p>
            <textarea
              aria-label="URL люстэркаў"
              readOnly
              value={manualCopy}
              rows={6}
              onFocus={(event) => event.currentTarget.select()}
            />
            <button type="button" className="mirror-button" onClick={() => setManualCopy('')}>
              Гатова
            </button>
          </div>
        </WorkspaceDialog>
      )}
    </main>
  );
}
