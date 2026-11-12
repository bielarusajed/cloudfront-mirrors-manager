'use client';

import { checkAvailability } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AvailabilityChecker({ domain }: { domain: string }) {
  const query = useQuery({
    queryKey: ['availability', domain],
    queryFn: () => checkAvailability(domain),
    enabled: false,
    retry: false,
  });
  const status = query.isFetching
    ? 'checking'
    : query.isError
      ? 'error'
      : query.data === true
        ? 'available'
        : query.data === false
          ? 'unavailable'
          : 'unchecked';
  const labels = {
    checking: 'Праверка…',
    error: 'Памылка праверкі',
    available: 'Даступнае',
    unavailable: 'Недаступнае',
    unchecked: 'Не праверана',
  };
  return (
    <div className="mirror-availability">
      <span className={`mirror-check-result is-${status}`} aria-live="polite">
        <i aria-hidden />
        {labels[status]}
      </span>
      <button
        type="button"
        className="mirror-check"
        disabled={query.isFetching || !domain}
        aria-label={`Праверыць URL ${domain}`}
        onClick={async () => {
          const result = await query.refetch();
          if (result.error) toast.error('Не атрымалася праверыць URL', { description: result.error.message });
        }}
      >
        {query.isFetching ? <LoaderCircle size={12} className="mirror-spinner" /> : <RefreshCw size={12} />}
        {status === 'unchecked' ? 'Праверыць URL' : 'Яшчэ раз'}
      </button>
    </div>
  );
}
