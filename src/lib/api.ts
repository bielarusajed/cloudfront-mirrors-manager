import type {
  CreateDistributionBatchResponse,
  DistributionStatus,
  DistributionsListResponse,
} from '@/types/distribution';
import type { CachePolicySummary, OriginRequestPolicySummary } from '@aws-sdk/client-cloudfront';

export type PoliciesResponse = {
  cachePolicies: CachePolicySummary[];
  originRequestPolicies: OriginRequestPolicySummary[];
};
export type CreateBatchParams = {
  originDomainName: string;
  count: number;
  cachePolicyId: string;
  originRequestPolicyId: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 204 && response.ok) return undefined as T;
  const data = await response.json().catch(() => {
    throw new Error('Не атрымалася прачытаць адказ сервера');
  });
  if (!response.ok || data.error) throw new Error(data.error || 'Не атрымалася выканаць запыт');
  return data as T;
}

export function fetchDistributions(): Promise<DistributionsListResponse> {
  return request('/api/distributions');
}
export function fetchPolicies(): Promise<PoliciesResponse> {
  return request('/api/policies');
}
export function createDistributions(params: CreateBatchParams): Promise<CreateDistributionBatchResponse> {
  return request('/api/distributions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}
export function setDistributionEnabled(id: string, enabled: boolean): Promise<void> {
  return request(`/api/distributions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
}
export function removeDistribution(id: string): Promise<void> {
  return request(`/api/distributions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export function updateComments(id: string, comments: string): Promise<void> {
  return request(`/api/distributions/${encodeURIComponent(id)}/comments`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments }),
  });
}
export async function checkAvailability(domain: string): Promise<boolean> {
  const endpoint = process.env.NEXT_PUBLIC_AVAILABILITY_CHECKER;
  if (!endpoint) throw new Error('Сэрвіс праверкі даступнасці не наладжаны');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url: domain }).toString(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error('Сэрвіс праверкі вярнуў памылку');
  const data = await response.json();
  if (typeof data.ok !== 'boolean') throw new Error('Няправільны адказ сэрвісу праверкі');
  return data.ok;
}
export async function fetchDistributionStatus(id: string): Promise<DistributionStatus | undefined> {
  return (await request<{ status?: DistributionStatus }>(`/api/distributions/${encodeURIComponent(id)}/status`)).status;
}
