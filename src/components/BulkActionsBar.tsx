'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchDistributions } from '@/lib/api';
import { clearSelectionAtom, selectedDistributionsAtom } from '@/lib/atoms';
import type { DistributionSummary } from '@/types/distribution';
import { useQuery } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { Copy, X } from 'lucide-react';
import { toast } from 'sonner';

export function BulkActionsBar() {
  const selectedIds = useAtomValue(selectedDistributionsAtom);
  const [, clearSelection] = useAtom(clearSelectionAtom);
  const hasSelection = selectedIds.size > 0;

  const { data: distributionsData } = useQuery({
    queryKey: ['distributions'],
    queryFn: fetchDistributions,
  });

  const distributions = distributionsData?.items ?? [];
  const selectedDistributions = distributions.filter((dist: DistributionSummary) => selectedIds.has(dist.id));

  const handleCopyUrls = async () => {
    const urls = selectedDistributions.map((dist: DistributionSummary) => `https://${dist.domainName}`).join('\n');

    try {
      await navigator.clipboard.writeText(urls);
      toast.success('URL скапіраваныя ў буфер абмену', {
        description: `Скапіравана ${selectedDistributions.length} URL`,
      });
    } catch (error) {
      toast.error('Не атрымалася скапіраваць URL');
    }
  };

  // Заўсёды рэндэрым, але з анімацыяй

  return (
    <div
      className={`-translate-x-1/2 fixed bottom-4 left-1/2 z-50 transform transition-all duration-300 ease-out ${
        hasSelection
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <Card className="border-2 bg-background/95 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4">
          <span className="font-medium text-sm">Выбрана: {selectedIds.size} distribution</span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyUrls} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Скапіраваць URL
            </Button>

            <Button variant="outline" size="sm" onClick={() => clearSelection()} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Ачысціць выбар
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
