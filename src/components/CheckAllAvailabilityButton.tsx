'use client';

import { Button } from '@/components/ui/button';
import { checkAvailability, fetchDistributions } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Wifi } from 'lucide-react';

export function CheckAllAvailabilityButton() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['distributions'],
    queryFn: fetchDistributions,
  });

  const handleCheckAll = async () => {
    const distributions = data?.items ?? [];
    for (const distribution of distributions)
      await queryClient.fetchQuery({
        queryKey: ['availability', distribution.domainName],
        queryFn: () => checkAvailability(distribution.domainName),
      });
  };

  return (
    <Button
      variant="outline"
      onClick={handleCheckAll}
      disabled={isLoading || !data?.items?.length}
      className="w-full md:w-auto"
    >
      <Wifi />
      Праверыць даступнасць усіх Distribution
    </Button>
  );
}
