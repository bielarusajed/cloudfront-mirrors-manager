import { CheckAllAvailabilityButton } from '@/components/CheckAllAvailabilityButton';
import { CreateDistributionDialog } from '@/components/CreateDistributionDialog';
import { DistributionsList } from '@/components/DistributionsList';
import { Button } from '@/components/ui/button';
import { isAuthenticated } from '@/lib/auth';
import { getDistributions, getPolicies } from '@/lib/server-api';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
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

  await queryClient.prefetchQuery({
    queryKey: ['distributions'],
    queryFn: getDistributions,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="container mx-auto flex min-h-screen flex-col gap-8 p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="font-bold text-2xl">CloudFront Manager</h1>
          <div className="flex flex-col gap-4 md:flex-row">
            <CreateDistributionDialog />
            <CheckAllAvailabilityButton />
            <Button onClick={signOut} variant="outline" className="w-full md:w-auto">
              <LogOut />
              Выйсці
            </Button>
          </div>
        </div>
        <DistributionsList />
      </main>
    </HydrationBoundary>
  );
}
