import type {
  AWSDistributionResponse,
  CachePolicyResponse,
  OriginRequestPolicyResponse,
} from '@/types/aws';
import type {
  CreateDistributionRequest,
  CreateDistributionResponse,
  DeleteDistributionResponse,
  DistributionStatus,
  UpdateDistributionResponse,
} from '@/types/distribution';
import {
  CloudFrontClient,
  CreateDistributionCommand,
  DeleteDistributionCommand,
  GetDistributionCommand,
  ListCachePoliciesCommand,
  ListDistributionsCommand,
  ListOriginRequestPoliciesCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { getAwsCredentials } from './auth';

// Ініцыялізуем CloudFront кліент з крэдэнцыяламі з cookie
export async function getCloudFrontClient() {
  const credentials = await getAwsCredentials();

  if (!credentials) {
    throw new Error('AWS credentials not found');
  }

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
}: CreateDistributionRequest): Promise<CreateDistributionResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const command = new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: Date.now().toString(),
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
    return {
      id: response.Distribution?.Id,
    };
  } catch (error) {
    console.error('Error creating distribution:', error);
    return {
      error: 'Не атрымалася стварыць distribution',
    };
  }
}

export async function listDistributions(): Promise<AWSDistributionResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const command = new ListDistributionsCommand({});
    const response = await cloudfront.send(command);
    return {
      items: response.DistributionList?.Items || [],
    };
  } catch (error) {
    console.error('Error listing distributions:', error);
    return {
      items: [],
      error: 'Не атрымалася атрымаць спіс distributions',
    };
  }
}

export async function getDistributionETag(
  id: string,
): Promise<string | undefined> {
  try {
    const cloudfront = await getCloudFrontClient();
    const command = new GetDistributionCommand({ Id: id });
    const response = await cloudfront.send(command);
    return response.ETag;
  } catch (error) {
    console.error('Error getting distribution ETag:', error);
    return undefined;
  }
}

export async function disableDistribution(
  id: string,
): Promise<UpdateDistributionResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const getCommand = new GetDistributionCommand({ Id: id });
    const distribution = await cloudfront.send(getCommand);

    if (!distribution.Distribution || !distribution.ETag) {
      return {
        error: 'Не атрымалася атрымаць інфармацыю аб distribution',
      };
    }

    const config = distribution.Distribution.DistributionConfig;
    if (!config) {
      return {
        error: 'Не атрымалася атрымаць канфігурацыю distribution',
      };
    }

    // Выключаем distribution
    config.Enabled = false;

    const updateCommand = new UpdateDistributionCommand({
      Id: id,
      DistributionConfig: config,
      IfMatch: distribution.ETag,
    });

    await cloudfront.send(updateCommand);
    return {};
  } catch (error) {
    console.error('Error disabling distribution:', error);
    return {
      error: 'Не атрымалася выключыць distribution',
    };
  }
}

export async function deleteDistribution(
  id: string,
): Promise<DeleteDistributionResponse> {
  try {
    // Спачатку выключаем distribution
    const disableResult = await disableDistribution(id);
    if (disableResult.error) {
      return disableResult;
    }

    // Чакаем, пакуль distribution будзе выключаны
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Атрымліваем актуальны ETag
    const etag = await getDistributionETag(id);
    if (!etag) {
      return {
        error: 'Не атрымалася атрымаць версію distribution',
      };
    }

    const cloudfront = await getCloudFrontClient();
    const command = new DeleteDistributionCommand({
      Id: id,
      IfMatch: etag,
    });
    await cloudfront.send(command);
    return {};
  } catch (error) {
    console.error('Error deleting distribution:', error);
    return {
      error: 'Не атрымалася выдаліць distribution',
    };
  }
}

export async function enableDistribution(
  id: string,
): Promise<UpdateDistributionResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const getCommand = new GetDistributionCommand({ Id: id });
    const distribution = await cloudfront.send(getCommand);

    if (!distribution.Distribution || !distribution.ETag) {
      return {
        error: 'Не атрымалася атрымаць інфармацыю аб distribution',
      };
    }

    const config = distribution.Distribution.DistributionConfig;
    if (!config) {
      return {
        error: 'Не атрымалася атрымаць канфігурацыю distribution',
      };
    }

    // Уключаем distribution
    config.Enabled = true;

    const updateCommand = new UpdateDistributionCommand({
      Id: id,
      DistributionConfig: config,
      IfMatch: distribution.ETag,
    });

    await cloudfront.send(updateCommand);
    return {};
  } catch (error) {
    console.error('Error enabling distribution:', error);
    return {
      error: 'Не атрымалася ўключыць distribution',
    };
  }
}

export async function listCachePolicies(): Promise<CachePolicyResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const command = new ListCachePoliciesCommand({});
    const response = await cloudfront.send(command);
    return {
      items: response.CachePolicyList?.Items || [],
    };
  } catch (error) {
    console.error('Error listing cache policies:', error);
    return {
      items: [],
      error: 'Не атрымалася атрымаць спіс палітык кэшавання',
    };
  }
}

export async function listOriginRequestPolicies(): Promise<OriginRequestPolicyResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const command = new ListOriginRequestPoliciesCommand({});
    const response = await cloudfront.send(command);
    return {
      items: response.OriginRequestPolicyList?.Items || [],
    };
  } catch (error) {
    console.error('Error listing origin request policies:', error);
    return {
      items: [],
      error: 'Не атрымалася атрымаць спіс палітык запытаў да крыніц',
    };
  }
}

export async function getDistributionStatus(
  id: string,
): Promise<DistributionStatus | undefined> {
  try {
    const cloudfront = await getCloudFrontClient();
    const command = new GetDistributionCommand({ Id: id });
    const response = await cloudfront.send(command);
    return response.Distribution?.Status as DistributionStatus;
  } catch (error) {
    console.error('Error getting distribution status:', error);
    return undefined;
  }
}

export async function updateDistributionComments(
  id: string,
  comments: string,
): Promise<UpdateDistributionResponse> {
  try {
    const cloudfront = await getCloudFrontClient();
    const getCommand = new GetDistributionCommand({ Id: id });
    const distribution = await cloudfront.send(getCommand);

    if (!distribution.Distribution || !distribution.ETag) {
      return {
        error: 'Не атрымалася атрымаць інфармацыю аб distribution',
      };
    }

    const config = distribution.Distribution.DistributionConfig;
    if (!config) {
      return {
        error: 'Не атрымалася атрымаць канфігурацыю distribution',
      };
    }

    config.Comment = comments;

    const updateCommand = new UpdateDistributionCommand({
      Id: id,
      DistributionConfig: config,
      IfMatch: distribution.ETag,
    });

    await cloudfront.send(updateCommand);
    return {};
  } catch (error) {
    console.error('Error updating distribution comments:', error);
    return {
      error: 'Не атрымалася абнавіць тэгі distribution',
    };
  }
}
