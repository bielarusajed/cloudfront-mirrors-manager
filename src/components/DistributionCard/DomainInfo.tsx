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
        className="font-mono text-sm hover:underline text-muted-foreground truncate"
      >
        {distribution.domainName}
      </a>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 ml-1 shrink-0"
        onClick={handleCopy}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}
