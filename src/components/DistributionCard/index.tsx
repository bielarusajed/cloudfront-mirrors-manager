'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchDistributionStatus } from '@/lib/api';
import { selectedDistributionsAtom, toggleDistributionSelectionAtom } from '@/lib/atoms';
import type { DistributionStatus, DistributionSummary } from '@/types/distribution';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import { toast } from 'sonner';
import { ActionButtons } from './ActionButtons';
import { AvailabilityChecker } from './AvailabilityChecker';
import { BadgesSection } from './BadgesSection';
import { DistributionInfo as DistributionInfoComponent } from './DistributionInfo';
import { DomainInfo } from './DomainInfo';

type DistributionCardProps = {
  distribution: DistributionSummary;
};

export function DistributionCard({ distribution }: DistributionCardProps) {
  const previousStatusRef = useRef<DistributionStatus | undefined>(undefined);
  const queryClient = useQueryClient();

  const selectedDistributions = useAtomValue(selectedDistributionsAtom);
  const isSelected = selectedDistributions.has(distribution.id);
  const [, toggleSelection] = useAtom(toggleDistributionSelectionAtom);

  const handleStatusChange = async (status: DistributionStatus) => {
    await queryClient.invalidateQueries({ queryKey: ['distributions'] });
    const message = status === 'Deployed' ? 'Distribution паспяхова разгорнуты' : 'Distribution паспяхова выключаны';
    toast.success(message, { description: `ID: ${distribution.id}` });
  };

  useQuery<DistributionStatus | undefined>({
    queryKey: ['distribution-status', distribution.id],
    queryFn: () => fetchDistributionStatus(distribution.id),
    enabled: distribution.status === 'InProgress' || distribution.status === 'Creating',
    refetchInterval: ({ state }) =>
      !state.data || state.data === 'Deployed' || state.data === 'Disabled' ? false : 5000,
    select: (data: DistributionStatus | undefined) => {
      if (!data || data === previousStatusRef.current) return data;
      if (data === 'Deployed' || data === 'Disabled') handleStatusChange(data);
      previousStatusRef.current = data;
      return data;
    },
  });

  return (
    <Card className={`gap-2.5 transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelection(distribution.id)}
              aria-label={`Выбраць distribution ${distribution.id}`}
            />
            <CardTitle className="text-muted-foreground text-sm">ID: {distribution.id}</CardTitle>
          </div>
          <ActionButtons distribution={distribution} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <BadgesSection distribution={distribution} />
        <DomainInfo distribution={distribution} />
        <AvailabilityChecker domain={distribution.domainName} />
        <DistributionInfoComponent distribution={distribution} />
      </CardContent>
    </Card>
  );
}
