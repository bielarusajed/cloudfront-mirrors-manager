import { MirrorsWorkspace } from '@/components/MirrorsWorkspace';
import { isAuthenticated } from '@/lib/auth';
import { getDistributions, getPolicies } from '@/lib/server-api';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

export default async function Home() {
  if (!(await isAuthenticated())) redirect('/signin');
  const client = new QueryClient();
  await Promise.all([
    client.prefetchQuery({ queryKey: ['policies'], queryFn: getPolicies }),
    client.prefetchQuery({ queryKey: ['distributions'], queryFn: getDistributions }),
  ]);
  return (
    <HydrationBoundary state={dehydrate(client)}>
      <MirrorsWorkspace initialNow={Date.now()} />
    </HydrationBoundary>
  );
}
