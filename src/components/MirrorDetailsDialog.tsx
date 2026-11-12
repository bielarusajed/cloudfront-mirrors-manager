'use client';

import { WorkspaceDialog } from '@/components/WorkspaceDialog';
import { fetchPolicies, removeDistribution, setDistributionEnabled, updateComments } from '@/lib/api';
import type { DistributionSummary } from '@/types/distribution';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export function MirrorDetailsDialog({
  distribution,
  onClose,
  onUpdated,
  onDeleted,
  onCopy,
}: {
  distribution: DistributionSummary;
  onClose: () => void;
  onUpdated: (patch: Partial<DistributionSummary>) => void;
  onDeleted: () => void;
  onCopy: () => void;
}) {
  const [note, setNote] = useState(distribution.comments || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const policies = useQuery({ queryKey: ['policies'], queryFn: fetchPolicies });
  const failure = (error: Error) => toast.error(error.message);
  const save = useMutation({
    mutationFn: () => updateComments(distribution.id, note),
    onSuccess: () => {
      onUpdated({ comments: note, status: 'InProgress', lastModifiedTime: new Date().toISOString() });
      toast.success('Нататка захаваная');
    },
    onError: failure,
  });
  const toggle = useMutation({
    mutationFn: () => setDistributionEnabled(distribution.id, !distribution.enabled),
    onSuccess: () => {
      onUpdated({ enabled: !distribution.enabled, status: 'InProgress', lastModifiedTime: new Date().toISOString() });
      toast.success(distribution.enabled ? 'Люстэрка выключаецца' : 'Люстэрка ўключаецца');
    },
    onError: failure,
  });
  const remove = useMutation({
    mutationFn: () => removeDistribution(distribution.id),
    onSuccess: () => {
      onDeleted();
      toast.success('Люстэрка выдаленае');
    },
    onError: failure,
  });
  const busy = save.isPending || toggle.isPending || remove.isPending;
  const settled = distribution.status === 'Deployed' || distribution.status === 'Disabled';
  const cacheName = policies.data?.cachePolicies.find((p) => p.CachePolicy?.Id === distribution.cachePolicyId)
    ?.CachePolicy?.CachePolicyConfig?.Name;
  const requestName = policies.data?.originRequestPolicies.find(
    (p) => p.OriginRequestPolicy?.Id === distribution.originRequestPolicyId,
  )?.OriginRequestPolicy?.OriginRequestPolicyConfig?.Name;
  return (
    <WorkspaceDialog title="Падрабязнасці люстэрка" onClose={onClose} busy={busy}>
      <div className="mirror-details">
        <div className="mirror-full-url">
          <a href={`https://${distribution.domainName}`} target="_blank" rel="noreferrer">
            https://{distribution.domainName}
          </a>
          <button type="button" className="mirror-button" onClick={onCopy} disabled={!distribution.domainName}>
            Скапіяваць URL
          </button>
        </div>
        <dl>
          <div>
            <dt>ID размеркавання</dt>
            <dd>{distribution.id}</dd>
          </div>
          <div>
            <dt>Крыніцы</dt>
            <dd>{distribution.origins.map((o) => o.domainName).join(', ')}</dd>
          </div>
          <div>
            <dt>Стан</dt>
            <dd>{!settled ? 'Абнаўляецца' : distribution.enabled ? 'Уключана' : 'Выключана'}</dd>
          </div>
          <div>
            <dt>Апошняе абнаўленне</dt>
            <dd>
              {distribution.lastModifiedTime
                ? new Intl.DateTimeFormat('be-BY', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(distribution.lastModifiedTime),
                  )
                : 'Няма даных'}
            </dd>
          </div>
          <div>
            <dt>Палітыка кэшавання</dt>
            <dd>{cacheName || distribution.cachePolicyId || 'Няма даных'}</dd>
          </div>
          <div>
            <dt>Палітыка запытаў</dt>
            <dd>{requestName || distribution.originRequestPolicyId || 'Няма даных'}</dd>
          </div>
        </dl>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <label>
            Нататкі / тэгі
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={128}
              disabled={busy}
            />
            <small>Тэгі можна падзяляць кропкай з коскай. Да 128 знакаў.</small>
          </label>
          <button type="submit" className="mirror-button" disabled={busy || note === (distribution.comments || '')}>
            {save.isPending ? 'Захаванне…' : 'Захаваць нататку'}
          </button>
        </form>
        <footer className="mirror-detail-actions">
          <button type="button" className="mirror-button" onClick={() => toggle.mutate()} disabled={busy || !settled}>
            {toggle.isPending ? 'Змена стану…' : distribution.enabled ? 'Выключыць люстэрка' : 'Уключыць люстэрка'}
          </button>
          {!distribution.enabled && (
            <button
              type="button"
              className="mirror-button mirror-danger"
              disabled={busy || !settled}
              onClick={() => setConfirmDelete(true)}
            >
              Выдаліць
            </button>
          )}
        </footer>
        {!settled && <p className="mirror-help">CloudFront абнаўляе размеркаванне. Стан абновіцца аўтаматычна.</p>}
        {confirmDelete && (
          <section className="mirror-delete-confirm" aria-label="Пацвярджэнне выдалення">
            <p>Выдаліць гэтае люстэрка назаўсёды? Гэта дзеянне нельга адмяніць.</p>
            <div>
              <button type="button" className="mirror-button" disabled={busy} onClick={() => setConfirmDelete(false)}>
                Адмена
              </button>
              <button
                type="button"
                className="mirror-button mirror-danger"
                disabled={busy || distribution.enabled || !settled}
                onClick={() => remove.mutate()}
              >
                {remove.isPending ? 'Выдаленне…' : 'Выдаліць назаўсёды'}
              </button>
            </div>
          </section>
        )}
      </div>
    </WorkspaceDialog>
  );
}
