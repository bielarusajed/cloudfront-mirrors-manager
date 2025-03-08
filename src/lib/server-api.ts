import type {
  DistributionStatus,
  DistributionsListResponse,
} from '@/types/distribution';
import type { PoliciesResponse } from './api';
import {
  listCachePolicies,
  listDistributions,
  listOriginRequestPolicies,
} from './aws';

export async function getPolicies(): Promise<PoliciesResponse> {
  const [cacheResponse, originResponse] = await Promise.all([
    listCachePolicies(),
    listOriginRequestPolicies(),
  ]);

  return {
    cachePolicies: cacheResponse.error ? [] : cacheResponse.items,
    originRequestPolicies: originResponse.error ? [] : originResponse.items,
    error: cacheResponse.error || originResponse.error,
  };
}

export async function getDistributions(): Promise<DistributionsListResponse> {
  const response = await listDistributions();
  return {
    items: response.items.map((item) => ({
      id: item.Id || '',
      status: (item.Status || 'InProgress') as DistributionStatus,
      enabled: item.Enabled || false,
      domainName: item.DomainName || '',
      lastModifiedTime: item.LastModifiedTime
        ? new Date(item.LastModifiedTime)
        : undefined,
      origins:
        item.Origins?.Items?.map((origin) => ({
          domainName: origin.DomainName || '',
        })) || [],
    })),
    error: response.error,
  };
}
