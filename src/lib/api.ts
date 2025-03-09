import type {
  CreateDistributionRequest,
  CreateDistributionResponse,
  DeleteDistributionResponse,
  DistributionStatus,
  DistributionsListResponse,
  UpdateDistributionResponse,
} from '@/types/distribution';
import type { CachePolicySummary, OriginRequestPolicySummary } from '@aws-sdk/client-cloudfront';
import { getBaseUrl } from './utils';

export type PoliciesResponse = {
  cachePolicies: CachePolicySummary[];
  originRequestPolicies: OriginRequestPolicySummary[];
};

export async function fetchDistributions(): Promise<DistributionsListResponse> {
  const response = await fetch('/api/distributions');
  const data = await response.json();
  if ('error' in data) throw new Error(data.error);
  return data;
}

export async function fetchPolicies(): Promise<PoliciesResponse> {
  const response = await fetch(`${getBaseUrl()}/api/policies`);
  const data = await response.json();
  if ('error' in data) throw new Error(data.error);
  return data;
}

export async function fetchDistributionStatus(id: string): Promise<DistributionStatus | undefined> {
  const response = await fetch(`/api/distributions/${id}/status`);
  const data = await response.json();
  if ('error' in data) throw new Error(data.error);
  return data.status;
}
