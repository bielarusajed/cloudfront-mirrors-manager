'use server';

import {
  authenticate as authAction,
  signOut as signOutAction,
} from '@/lib/auth';
import {
  createDistribution,
  deleteDistribution,
  disableDistribution,
  enableDistribution,
} from '@/lib/aws';
import { revalidatePath } from 'next/cache';

export { authAction as authenticate, signOutAction as signOut };

interface CreateDistributionParams {
  originDomainName: string;
  cachePolicyId: string;
  originRequestPolicyId: string;
}

export async function createDistributionAction(
  params: CreateDistributionParams,
) {
  const result = await createDistribution(params);
  if (!result.error) {
    revalidatePath('/');
  }
  return result;
}

export async function deleteDistributionAction(id: string) {
  const result = await deleteDistribution(id);
  if (!result.error) {
    revalidatePath('/');
  }
  return result;
}

export async function disableDistributionAction(id: string) {
  const result = await disableDistribution(id);
  if (!result.error) {
    revalidatePath('/');
  }
  return result;
}

export async function enableDistributionAction(id: string) {
  const result = await enableDistribution(id);
  if (!result.error) {
    revalidatePath('/');
  }
  return result;
}

export async function revalidateDistributionsAction() {
  revalidatePath('/');
}
