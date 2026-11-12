'use client';

import { checkAvailability } from '@/lib/api';
import type { DistributionSummary } from '@/types/distribution';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CheckAllAvailabilityButton({ distributions }: { distributions: DistributionSummary[] }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function checkAll() {
    setBusy(true);
    const remaining = [...new Set(distributions.map((d) => d.domainName).filter(Boolean))];
    let available = 0;
    let unavailable = 0;
    let failed = 0;
    async function worker() {
      let domain = remaining.shift();
      while (domain) {
        const current = domain;
        try {
          if (
            await client.fetchQuery({
              queryKey: ['availability', current],
              queryFn: () => checkAvailability(current),
              retry: false,
              staleTime: 0,
            })
          )
            available++;
          else unavailable++;
        } catch {
          failed++;
        }
        domain = remaining.shift();
      }
    }
    try {
      await Promise.all(Array.from({ length: Math.min(4, remaining.length) }, worker));
      if (failed)
        toast.error(`Не ўдалося праверыць URL: ${failed}`, {
          description: `Даступныя: ${available}; недаступныя: ${unavailable}.`,
        });
      else toast.success(`Праверка завершана: даступныя ${available}, недаступныя ${unavailable}.`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      className="mirror-button mirror-check-all"
      onClick={checkAll}
      disabled={busy || !distributions.some((d) => d.domainName)}
    >
      {busy ? <LoaderCircle size={14} className="mirror-spinner" /> : <RefreshCw size={14} />}
      {busy ? 'Праверка URL…' : 'Праверыць усе URL'}
    </button>
  );
}
