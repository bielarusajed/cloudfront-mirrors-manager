'use client';

import { DistributionCard } from '@/components/DistributionCard';
import { fetchDistributions } from '@/lib/api';
import type { DistributionSummary } from '@/types/distribution';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DistributionsList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['distributions'],
    queryFn: fetchDistributions,
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Загрузка distributions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="font-bold text-xl">Памылка</h2>
        <p className="text-muted-foreground">{error instanceof Error ? error.message : 'Нешта пайшло не так'}</p>
      </div>
    );
  }

  const distributions = data?.items ?? [];

  if (distributions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="font-bold text-xl">Няма distributions</h2>
        <p className="text-muted-foreground">
          Няма даступных distributions. Стварыце новы distribution, каб пачаць працу.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {distributions.map((distribution: DistributionSummary) => (
        <DistributionCard key={distribution.id} distribution={distribution} />
      ))}
    </div>
  );
}
