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
    <div className="flex items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm hover:underline"
      >
        {distribution.domainName}
      </a>
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
