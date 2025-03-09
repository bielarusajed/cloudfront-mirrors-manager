import type { DistributionSummary } from '@/types/distribution';
import { formatDistanceToNow } from 'date-fns';
import { be } from 'date-fns/locale';

type DistributionInfoProps = {
  distribution: DistributionSummary;
};

export function DistributionInfo({ distribution }: DistributionInfoProps) {
  const lastModifiedTime = distribution.lastModifiedTime || new Date();
  const timeAgo = formatDistanceToNow(lastModifiedTime, { addSuffix: true, locale: be });

  return (
    <div className="text-sm">
      {distribution.origins.length > 0 && (
        <p>
          <span className="text-muted-foreground">Крыніцы: </span>
          <span className="truncate font-mono">{distribution.origins.map((o) => o.domainName).join(', ')}</span>
        </p>
      )}
      <p>
        <span className="text-muted-foreground">Апошняе абнаўленне: </span>
        <span className="truncate">{timeAgo}</span>
      </p>
    </div>
  );
}
