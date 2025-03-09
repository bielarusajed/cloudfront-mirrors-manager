export type DistributionOrigin = {
  domainName: string;
};

export type DistributionStatus = 'InProgress' | 'Deployed' | 'Disabled' | 'Creating' | 'Deleting';

export type DistributionSummary = {
  id: string;
  status: DistributionStatus;
  enabled: boolean;
  domainName: string;
  lastModifiedTime?: Date;
  origins: DistributionOrigin[];
  comments?: string;
};

export type DistributionDetails = DistributionSummary;

export type CreateDistributionRequest = {
  originDomainName: string;
  cachePolicyId: string;
  originRequestPolicyId: string;
  comments?: string;
};

export type CreateDistributionResponse = {
  id?: string;
  error?: string;
};

export type UpdateDistributionResponse = {
  error?: string;
};

export type DeleteDistributionResponse = {
  error?: string;
};

export type DistributionsListResponse = {
  items: DistributionSummary[];
  error?: string;
};
