import type { CreateDistributionRequest, DistributionStatus } from '@/types/distribution';
import {
  type DistributionSummary as AWSDistributionSummary,
  type CachePolicySummary,
  CloudFrontClient,
  CreateDistributionCommand,
  DeleteDistributionCommand,
  GetDistributionCommand,
  ListCachePoliciesCommand,
  ListDistributionsCommand,
  ListOriginRequestPoliciesCommand,
  type OriginRequestPolicySummary,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { getAwsCredentials } from './auth';

// Ініцыялізуем CloudFront кліент з крэдэнцыяламі з cookie
export async function getCloudFrontClient() {
  const credentials = await getAwsCredentials();
  if (!credentials) throw new Error('AWS credentials not found');

  return new CloudFrontClient({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    region: credentials.region,
  });
}

export async function createDistribution({
  originDomainName,
  cachePolicyId,
  originRequestPolicyId,
  comments,
  callerReference,
}: CreateDistributionRequest): Promise<{ id: string }> {
  const cloudfront = await getCloudFrontClient();
  const command = new CreateDistributionCommand({
    DistributionConfig: {
      CallerReference: callerReference || Date.now().toString(),
      Enabled: true,
      Comment: comments || '',
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: 'CustomOrigin',
            DomainName: originDomainName,
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: 'match-viewer',
              OriginSslProtocols: {
                Quantity: 1,
                Items: ['TLSv1.2'],
              },
            },
          },
        ],
      },
      DefaultCacheBehavior: {
        TargetOriginId: 'CustomOrigin',
        ViewerProtocolPolicy: 'redirect-to-https',
        CachePolicyId: cachePolicyId,
        OriginRequestPolicyId: originRequestPolicyId,
        AllowedMethods: {
          Quantity: 2,
          Items: ['HEAD', 'GET'],
          CachedMethods: {
            Quantity: 2,
            Items: ['HEAD', 'GET'],
          },
        },
        Compress: true,
      },
      PriceClass: 'PriceClass_100',
      HttpVersion: 'http2and3',
    },
  });

  const response = await cloudfront.send(command);

  if (!response.Distribution?.Id) throw new Error('Не атрымалася стварыць distribution: ID не знойдзены');

  return {
    id: response.Distribution.Id,
  };
}

export async function listDistributions(): Promise<AWSDistributionSummary[]> {
  const cloudfront = await getCloudFrontClient();
  const command = new ListDistributionsCommand({});
  const response = await cloudfront.send(command);
  return response.DistributionList?.Items || [];
}

export async function getDistributionETag(id: string): Promise<string> {
  const cloudfront = await getCloudFrontClient();
  const command = new GetDistributionCommand({ Id: id });
  const response = await cloudfront.send(command);

  if (!response.ETag) throw new Error('Не атрымалася атрымаць ETag для distribution');

  return response.ETag;
}

export async function disableDistribution(id: string): Promise<void> {
  const cloudfront = await getCloudFrontClient();
  const getCommand = new GetDistributionCommand({ Id: id });
  const distribution = await cloudfront.send(getCommand);

  if (!distribution.Distribution || !distribution.ETag)
    throw new Error('Не атрымалася атрымаць інфармацыю аб distribution');

  const config = distribution.Distribution.DistributionConfig;
  if (!config) throw new Error('Не атрымалася атрымаць канфігурацыю distribution');

  config.Enabled = false;

  const updateCommand = new UpdateDistributionCommand({
    Id: id,
    DistributionConfig: config,
    IfMatch: distribution.ETag,
  });

  await cloudfront.send(updateCommand);
}

export async function deleteDistribution(id: string): Promise<void> {
  await disableDistribution(id);

  // Чакаем, пакуль distribution будзе выключаны
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const etag = await getDistributionETag(id);
  if (!etag) throw new Error('Не атрымалася атрымаць версію distribution');

  const cloudfront = await getCloudFrontClient();
  const command = new DeleteDistributionCommand({
    Id: id,
    IfMatch: etag,
  });
  await cloudfront.send(command);
}

export async function enableDistribution(id: string): Promise<void> {
  const cloudfront = await getCloudFrontClient();
  const getCommand = new GetDistributionCommand({ Id: id });
  const distribution = await cloudfront.send(getCommand);

  if (!distribution.Distribution || !distribution.ETag)
    throw new Error('Не атрымалася атрымаць інфармацыю аб distribution');

  const config = distribution.Distribution.DistributionConfig;
  if (!config) throw new Error('Не атрымалася атрымаць канфігурацыю distribution');

  config.Enabled = true;

  const updateCommand = new UpdateDistributionCommand({
    Id: id,
    DistributionConfig: config,
    IfMatch: distribution.ETag,
  });

  await cloudfront.send(updateCommand);
}

export async function listCachePolicies(): Promise<CachePolicySummary[]> {
  const cloudfront = await getCloudFrontClient();
  const command = new ListCachePoliciesCommand({});
  const response = await cloudfront.send(command);
  return response.CachePolicyList?.Items || [];
}

export async function listOriginRequestPolicies(): Promise<OriginRequestPolicySummary[]> {
  const cloudfront = await getCloudFrontClient();
  const command = new ListOriginRequestPoliciesCommand({});
  const response = await cloudfront.send(command);
  return response.OriginRequestPolicyList?.Items || [];
}

export async function getDistributionStatus(id: string): Promise<DistributionStatus> {
  const cloudfront = await getCloudFrontClient();
  const command = new GetDistributionCommand({ Id: id });
  const response = await cloudfront.send(command);

  if (!response.Distribution?.Status) throw new Error('Не атрымалася атрымаць статус distribution');

  return response.Distribution.Status as DistributionStatus;
}

export async function updateDistributionComments(id: string, comments: string): Promise<void> {
  const cloudfront = await getCloudFrontClient();
  const getCommand = new GetDistributionCommand({ Id: id });
  const distribution = await cloudfront.send(getCommand);

  if (!distribution.Distribution || !distribution.ETag) {
    throw new Error('Не атрымалася атрымаць інфармацыю аб distribution');
  }

  const config = distribution.Distribution.DistributionConfig;
  if (!config) {
    throw new Error('Не атрымалася атрымаць канфігурацыю distribution');
  }

  config.Comment = comments;

  const updateCommand = new UpdateDistributionCommand({
    Id: id,
    DistributionConfig: config,
    IfMatch: distribution.ETag,
  });

  await cloudfront.send(updateCommand);
}
