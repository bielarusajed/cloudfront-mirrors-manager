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

export { authAction as authenticate, signOutAction as signOut };

interface CreateDistributionParams {
  originDomainName: string;
  cachePolicyId: string;
  originRequestPolicyId: string;
}

export async function createDistributionAction(params: CreateDistributionParams) {
  await checkActionAuth();
  const result = await createDistribution(params);
  return result;
}

export async function deleteDistributionAction(id: string) {
  await checkActionAuth();
  const result = await deleteDistribution(id);
  return result;
}

export async function disableDistributionAction(id: string) {
  await checkActionAuth();
  const result = await disableDistribution(id);
  return result;
}

export async function enableDistributionAction(id: string) {
  await checkActionAuth();
  const result = await enableDistribution(id);
  return result;
}

export async function updateDistributionCommentsAction(id: string, newTags: string): Promise<void> {
  await checkActionAuth();
  await updateDistributionComments(id, newTags);
}
