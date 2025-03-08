import { Badge } from '@/components/ui/badge';
import type { DistributionSummary } from '@/types/distribution';
import { Loader2 } from 'lucide-react';

type StatusBadgeProps = {
  distribution: DistributionSummary;
};

export function StatusBadge({ distribution }: StatusBadgeProps) {
  const { status, enabled } = distribution;

  if (status === 'InProgress') {
    return (
      <Badge variant="secondary">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        {enabled ? 'Уключэнне...' : 'Выключэнне...'}
      </Badge>
    );
  }

  if (!enabled) {
    return <Badge variant="destructive">Выключаны</Badge>;
  }

  return <Badge variant="default">Уключаны</Badge>;
}
