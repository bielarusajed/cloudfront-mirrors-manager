'use client';

import { revalidateDistributionsAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDistributionStatus } from '@/lib/api';
import type { DistributionStatus, DistributionSummary } from '@/types/distribution';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { toast } from 'sonner';
import { ActionButtons } from './ActionButtons';
import { DistributionInfo as DistributionInfoComponent } from './DistributionInfo';
import { DomainInfo } from './DomainInfo';
import { StatusBadge } from './StatusBadge';

type DistributionCardProps = {
  distribution: DistributionSummary;
};

export function DistributionCard({ distribution }: DistributionCardProps) {
  const previousStatusRef = useRef<DistributionStatus | undefined>(undefined);

  useQuery<DistributionStatus | undefined>({
    queryKey: ['distribution-status', distribution.id],
    queryFn: () => fetchDistributionStatus(distribution.id),
    enabled: distribution.status === 'InProgress' || distribution.status === 'Creating',
    refetchInterval: ({ state }) =>
      !state.data || state.data === 'Deployed' || state.data === 'Disabled' ? false : 5000,
    select: (data: DistributionStatus | undefined) => {
      if (!data || data === previousStatusRef.current) return data;
      if (data === 'Deployed' || data === 'Disabled')
        revalidateDistributionsAction().then(() => {
          toast.success(
            data === 'Deployed' ? 'Distribution паспяхова разгорнуты' : 'Distribution паспяхова выключаны',
            { description: `ID: ${distribution.id}` },
          );
        });
      previousStatusRef.current = data;
      return data;
    },
  });

  return (
    <Card className="gap-2.5">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm">ID: {distribution.id}</CardTitle>
          <ActionButtons distribution={distribution} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <StatusBadge distribution={distribution} />
        <DomainInfo distribution={distribution} />
        <DistributionInfoComponent distribution={distribution} />
      </CardContent>
    </Card>
  );
}
