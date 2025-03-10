import { Button } from '@/components/ui/button';
import type { DistributionSummary } from '@/types/distribution';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

type DomainInfoProps = {
  distribution: DistributionSummary;
};

export function DomainInfo({ distribution }: DomainInfoProps) {
  const url = `https://${distribution.domainName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success('URL скапіраваны');
  };

  return (
    <div className="flex items-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate font-mono text-muted-foreground text-sm hover:underline"
      >
        {distribution.domainName}
      </a>
      <Button variant="ghost" size="icon" className="ml-1 size-5 shrink-0 p-0" onClick={handleCopy}>
        <Copy />
      </Button>
    </div>
  );
}
