'use client';

import { WorkspaceDialog } from '@/components/WorkspaceDialog';
import { createDistributions, fetchPolicies } from '@/lib/api';
import type { CreateDistributionBatchResponse } from '@/types/distribution';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function CreateDistributionDialog({
  onClose,
  onCreated,
}: { onClose: () => void; onCreated: (result: CreateDistributionBatchResponse) => void }) {
  const policies = useQuery({ queryKey: ['policies'], queryFn: fetchPolicies });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: createDistributions,
    onSuccess: (result) => {
      if (result.items.length) {
        onCreated(result);
        onClose();
      } else setError(result.errors[0]?.message || 'Не атрымалася стварыць люстэркі');
    },
    onError: (error) => setError(error.message),
  });
  const caches = policies.data?.cachePolicies.filter((p) => p.CachePolicy?.Id) ?? [];
  const requests = policies.data?.originRequestPolicies.filter((p) => p.OriginRequestPolicy?.Id) ?? [];
  const noPolicies = !caches.length || !requests.length;
  return (
    <WorkspaceDialog title="Стварыць люстэркі" onClose={onClose} busy={mutation.isPending}>
      <form
        className="mirror-form"
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          const data = new FormData(event.currentTarget);
          mutation.mutate({
            originDomainName: String(data.get('originDomainName')).trim(),
            count: Number(data.get('count')),
            cachePolicyId: String(data.get('cachePolicyId')),
            originRequestPolicyId: String(data.get('originRequestPolicyId')),
          });
        }}
      >
        <fieldset disabled={mutation.isPending}>
          <label className="app-field">
            Дамен крыніцы
            <input
              name="originDomainName"
              required
              maxLength={253}
              placeholder="news.example.org"
              pattern="[a-zA-Z0-9][a-zA-Z0-9.\-]*\.[a-zA-Z]{2,}"
              title="Увядзіце дамен без https:// і шляху"
            />
          </label>
          <label className="app-field">
            Колькасць люстэркаў
            <input type="number" name="count" required min={1} max={100} step={1} defaultValue={10} />
          </label>
          <label className="app-field">
            Палітыка кэшавання
            <select
              name="cachePolicyId"
              aria-label="Палітыка кэшавання"
              required
              defaultValue=""
              disabled={noPolicies || policies.isPending}
            >
              <option value="" disabled>
                Выберыце палітыку кэшавання
              </option>
              {caches.map(({ CachePolicy: p }) => (
                <option key={p?.Id} value={p?.Id}>
                  {p?.CachePolicyConfig?.Name || p?.Id}
                </option>
              ))}
            </select>
            <small>Выберыце, як захоўваць адказы ў кэшы.</small>
          </label>
          <label className="app-field">
            Палітыка запытаў да крыніцы
            <select
              name="originRequestPolicyId"
              aria-label="Палітыка запытаў да крыніцы"
              required
              defaultValue=""
              disabled={noPolicies || policies.isPending}
            >
              <option value="" disabled>
                Выберыце палітыку запытаў
              </option>
              {requests.map(({ OriginRequestPolicy: p }) => (
                <option key={p?.Id} value={p?.Id}>
                  {p?.OriginRequestPolicyConfig?.Name || p?.Id}
                </option>
              ))}
            </select>
            <small>Выберыце, якія даныя перадаваць крыніцы.</small>
          </label>
        </fieldset>
        {policies.isPending && <output>Загрузка палітык…</output>}
        {(policies.error || (!policies.isPending && noPolicies)) && (
          <div className="mirror-error" role="alert">
            Не атрымалася загрузіць палітыкі.{' '}
            <button type="button" onClick={() => policies.refetch()}>
              Паўтарыць
            </button>
          </div>
        )}
        {error && (
          <p className="mirror-error" role="alert">
            {error}
          </p>
        )}
        <footer className="mirror-dialog-actions">
          <button type="button" className="mirror-button" disabled={mutation.isPending} onClick={onClose}>
            Адмена
          </button>
          <button
            type="submit"
            className="mirror-button mirror-button-primary"
            disabled={mutation.isPending || policies.isPending || noPolicies}
          >
            {mutation.isPending ? 'Стварэнне…' : 'Стварыць'}
          </button>
        </footer>
      </form>
    </WorkspaceDialog>
  );
}
