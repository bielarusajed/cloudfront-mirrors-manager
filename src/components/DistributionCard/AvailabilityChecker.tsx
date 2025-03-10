import { Button } from '@/components/ui/button';
import { checkAvailability } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type AvailabilityCheckerProps = {
  domain: string;
};

export function AvailabilityChecker({ domain }: AvailabilityCheckerProps) {
  const { refetch, isLoading, data, error } = useQuery({
    queryKey: ['availability', domain],
    queryFn: () => checkAvailability(domain),
    enabled: false,
  });

  useEffect(() => {
    if (error)
      toast.error('Не атрымалася праверыць даступнасць', {
        description: error instanceof Error ? error.message : undefined,
      });
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center text-sm">
        <span className="text-muted-foreground">Даступнасць:&nbsp;</span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Праверка...
        </div>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="text-sm">
        <span className="text-muted-foreground">Даступнасць:&nbsp;</span>
        <Button variant="link" onClick={() => refetch()} className="h-auto p-0">
          Праверыць
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm">
      <span className="text-muted-foreground">Даступнасць:&nbsp;</span>
      <div className="flex items-center gap-1">
        {data ? (
          <>
            <CheckCircle2 className="size-4 text-green-500" />
            <span className="text-green-500">Даступны</span>
          </>
        ) : (
          <>
            <XCircle className="size-4 text-red-500" />
            <span className="text-red-500">Недаступны</span>
          </>
        )}
      </div>
    </div>
  );
}
