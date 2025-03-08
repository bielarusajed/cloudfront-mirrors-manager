import type {
  CreateDistributionRequest,
  CreateDistributionResponse,
  DeleteDistributionResponse,
  DistributionStatus,
  DistributionsListResponse,
  UpdateDistributionResponse,
} from '@/types/distribution';
import type {
  CachePolicySummary,
  OriginRequestPolicySummary,
} from '@aws-sdk/client-cloudfront';
import { getBaseUrl } from './utils';

export type PoliciesResponse = {
  cachePolicies: CachePolicySummary[];
  originRequestPolicies: OriginRequestPolicySummary[];
  error?: string;
};

export async function fetchDistributions(): Promise<DistributionsListResponse> {
  const response = await fetch(`${getBaseUrl()}/api/distributions`);
  return response.json();
}

export async function fetchPolicies(): Promise<PoliciesResponse> {
  const response = await fetch(`${getBaseUrl()}/api/policies`);
  return response.json();
}

export async function fetchDistributionStatus(
  id: string,
): Promise<DistributionStatus | undefined> {
  const response = await fetch(`/api/distributions/${id}/status`);
  const data = await response.json();
  return data.status;
}

export async function createDistribution(
  params: CreateDistributionRequest,
): Promise<CreateDistributionResponse> {
  const response = await fetch(`${getBaseUrl()}/api/distributions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function deleteDistribution(
  id: string,
): Promise<DeleteDistributionResponse> {
  const response = await fetch(`${getBaseUrl()}/api/distributions/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function enableDistribution(
  id: string,
): Promise<UpdateDistributionResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/distributions/${id}/enable`,
    {
      method: 'POST',
    },
  );
  return response.json();
}

export async function disableDistribution(
  id: string,
): Promise<UpdateDistributionResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/distributions/${id}/disable`,
    {
      method: 'POST',
    },
  );
  return response.json();
}

export async function updateComments(
  id: string,
  comments: string,
): Promise<UpdateDistributionResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/distributions/${id}/comments`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comments }),
    },
  );
  return response.json();
}
