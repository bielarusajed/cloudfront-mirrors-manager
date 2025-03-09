'use server';

import { checkActionAuth } from '@/lib/action-auth';
import { authenticate as authAction, signOut as signOutAction } from '@/lib/auth';
import {
  createDistribution,
  deleteDistribution,
  disableDistribution,
  enableDistribution,
  updateDistributionComments,
} from '@/lib/aws';
import type { UpdateDistributionResponse } from '@/types/distribution';
import { revalidatePath } from 'next/cache';

export { authAction as authenticate, signOutAction as signOut };

interface CreateDistributionParams {
  originDomainName: string;
  cachePolicyId: string;
  originRequestPolicyId: string;
}

export async function createDistributionAction(params: CreateDistributionParams) {
  await checkActionAuth();
  const result = await createDistribution(params);
  revalidatePath('/');
  return result;
}

export async function deleteDistributionAction(id: string) {
  await checkActionAuth();
  const result = await deleteDistribution(id);
  revalidatePath('/');
  return result;
}

export async function disableDistributionAction(id: string) {
  await checkActionAuth();
  const result = await disableDistribution(id);
  revalidatePath('/');
  return result;
}

export async function enableDistributionAction(id: string) {
  await checkActionAuth();
  const result = await enableDistribution(id);
  revalidatePath('/');
  return result;
}

export async function revalidateDistributionsAction() {
  await checkActionAuth();
  return revalidatePath('/');
}

export async function updateDistributionCommentsAction(
  id: string,
  newTags: string,
): Promise<UpdateDistributionResponse> {
  await checkActionAuth();
  const result = await updateDistributionComments(id, newTags);
  revalidatePath('/');
  return result;
}
