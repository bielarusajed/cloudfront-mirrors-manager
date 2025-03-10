import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

type StatusIndicatorProps = {
  enabled: boolean;
  status: string;
};

export function StatusIndicator({ enabled, status }: StatusIndicatorProps) {
  if (status === 'InProgress') {
    return (
      <Badge variant="secondary">
        <Loader2 className="animate-spin" />
        {enabled ? 'Уключэнне...' : 'Выключэнне...'}
      </Badge>
    );
  }

  if (!enabled) {
    return <Badge variant="destructive">Выключаны</Badge>;
  }

  return <Badge variant="default">Уключаны</Badge>;
}
