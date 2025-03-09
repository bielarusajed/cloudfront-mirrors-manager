import type { DistributionStatus, DistributionsListResponse } from '@/types/distribution';
import type { PoliciesResponse } from './api';
import { listCachePolicies, listDistributions, listOriginRequestPolicies } from './aws';

export async function getPolicies(): Promise<PoliciesResponse> {
  const [cachePolicies, originRequestPolicies] = await Promise.all([listCachePolicies(), listOriginRequestPolicies()]);
  return { cachePolicies, originRequestPolicies };
}

export async function getDistributions(): Promise<DistributionsListResponse> {
  const items = await listDistributions();
  return {
    items: items.map((item) => ({
      id: item.Id || '',
      status: (item.Status || 'InProgress') as DistributionStatus,
      enabled: item.Enabled || false,
      domainName: item.DomainName || '',
      lastModifiedTime: item.LastModifiedTime ? new Date(item.LastModifiedTime) : undefined,
      origins:
        item.Origins?.Items?.map((origin) => ({
          domainName: origin.DomainName || '',
        })) || [],
      comments: item.Comment || undefined,
    })),
  };
}
