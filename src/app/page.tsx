import { CreateDistributionDialog } from '@/components/CreateDistributionDialog';
import { DistributionCard } from '@/components/DistributionCard';
import { Button } from '@/components/ui/button';
import { isAuthenticated } from '@/lib/auth';
import { getDistributions, getPolicies } from '@/lib/server-api';
import type { DistributionSummary } from '@/types/distribution';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';
import { signOut } from './actions';

export default async function Home() {
  if (!(await isAuthenticated())) redirect('/signin');

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['policies'],
    queryFn: getPolicies,
  });

  const { items: distributions, error } = await getDistributions();

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Памылка</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="container mx-auto flex min-h-screen flex-col gap-8 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CloudFront Manager</h1>
          <div className="flex gap-4">
            <CreateDistributionDialog />
            <Button onClick={signOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Выйсці
            </Button>
          </div>
        </div>

        {distributions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-bold">Няма distributions</h2>
            <p className="text-muted-foreground">
              Няма даступных distributions. Стварыце новы distribution, каб
              пачаць працу.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {distributions.map((distribution: DistributionSummary) => (
              <DistributionCard
                key={distribution.id}
                distribution={distribution}
              />
            ))}
          </div>
        )}
      </main>
    </HydrationBoundary>
  );
}
