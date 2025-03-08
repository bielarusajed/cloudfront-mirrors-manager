import type {
  DistributionSummary as AWSDistributionSummary,
  CachePolicySummary,
  OriginRequestPolicySummary,
} from '@aws-sdk/client-cloudfront';

export type CachePolicyResponse = {
  items: CachePolicySummary[];
  error?: string;
};

export type OriginRequestPolicyResponse = {
  items: OriginRequestPolicySummary[];
  error?: string;
};

export type AWSDistributionResponse = {
  items: AWSDistributionSummary[];
  error?: string;
};
