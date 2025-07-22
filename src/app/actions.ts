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
  count: number;
}

export async function createDistributionAction(params: CreateDistributionParams) {
  await checkActionAuth();

  const { count, ...distributionParams } = params;

  // Стварэнне distribution'ов паралельна з унікальнымі callerReference
  const promises = Array.from({ length: count }, () => {
    const uniqueCallerReference = `${Date.now()}-${crypto.randomUUID()}`;
    return createDistribution({
      ...distributionParams,
      callerReference: uniqueCallerReference,
    });
  });
  const results = await Promise.all(promises);

  return results;
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
