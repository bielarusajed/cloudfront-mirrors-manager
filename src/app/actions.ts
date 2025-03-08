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
  updateDistributionComments,
} from '@/lib/aws';
import { getDistributions } from '@/lib/server-api';
import type {
  DistributionSummary,
  UpdateDistributionResponse,
} from '@/types/distribution';
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
  await revalidatePath('/');
  return result;
}

export async function deleteDistributionAction(id: string) {
  const result = await deleteDistribution(id);
  await revalidatePath('/');
  return result;
}

export async function disableDistributionAction(id: string) {
  const result = await disableDistribution(id);
  await revalidatePath('/');
  return result;
}

export async function enableDistributionAction(id: string) {
  const result = await enableDistribution(id);
  await revalidatePath('/');
  return result;
}

export async function revalidateDistributionsAction() {
  return revalidatePath('/');
}

export async function updateDistributionCommentsAction(
  id: string,
  newTags: string,
): Promise<UpdateDistributionResponse> {
  const result = await updateDistributionComments(id, newTags);
  await revalidatePath('/');
  return result;
}
