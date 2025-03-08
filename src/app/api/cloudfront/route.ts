import { checkApiAuth } from '@/lib/api-auth';
import { getCloudFrontClient } from '@/lib/aws';
import {
  CreateDistributionCommand,
  DeleteDistributionCommand,
  GetDistributionCommand,
  ListDistributionsCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/cloudfront - атрымаць спіс distributions
export async function GET() {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const cloudfront = await getCloudFrontClient();
    const command = new ListDistributionsCommand({});
    const response = await cloudfront.send(command);

    return NextResponse.json({
      distributions: response.DistributionList?.Items || [],
    });
  } catch (error) {
    console.error('Error listing CloudFront distributions:', error);
    return NextResponse.json(
      { error: 'Failed to list CloudFront distributions' },
      { status: 500 },
    );
  }
}

// POST /api/cloudfront - стварыць новы distribution
export async function POST(request: NextRequest) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { originDomain, enabled = true } = body;

    if (!originDomain) {
      return NextResponse.json(
        { error: 'originDomain is required' },
        { status: 400 },
      );
    }

    const cloudfront = await getCloudFrontClient();
    const command = new CreateDistributionCommand({
      DistributionConfig: {
        CallerReference: Date.now().toString(),
        Comment: `Distribution for ${originDomain}`,
        Enabled: enabled,
        DefaultCacheBehavior: {
          TargetOriginId: 'default',
          ViewerProtocolPolicy: 'redirect-to-https',
          AllowedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
          },
          ForwardedValues: {
            QueryString: false,
            Cookies: { Forward: 'none' },
          },
          MinTTL: 0,
          DefaultTTL: 86400,
          MaxTTL: 31536000,
        },
        Origins: {
          Quantity: 1,
          Items: [
            {
              Id: 'default',
              DomainName: originDomain,
              CustomOriginConfig: {
                HTTPPort: 80,
                HTTPSPort: 443,
                OriginProtocolPolicy: 'https-only',
              },
            },
          ],
        },
      },
    });

    const response = await cloudfront.send(command);

    return NextResponse.json({ distribution: response.Distribution });
  } catch (error) {
    console.error('Error creating CloudFront distribution:', error);
    return NextResponse.json(
      { error: 'Failed to create CloudFront distribution' },
      { status: 500 },
    );
  }
}

// DELETE /api/cloudfront?id={distributionId} - выдаліць distribution
export async function DELETE(request: NextRequest) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Distribution ID is required' },
        { status: 400 },
      );
    }

    const cloudfront = await getCloudFrontClient();

    // Спачатку атрымліваем distribution, каб праверыць яго стан і ETag
    const getCommand = new GetDistributionCommand({ Id: id });
    const distribution = await cloudfront.send(getCommand);

    if (!distribution.Distribution || !distribution.ETag) {
      return NextResponse.json(
        { error: 'Distribution not found' },
        { status: 404 },
      );
    }

    // Калі distribution уключаны, мы павінны спачатку яго выключыць
    if (distribution.Distribution.DistributionConfig?.Enabled) {
      const config = distribution.Distribution.DistributionConfig;
      const updateCommand = new UpdateDistributionCommand({
        Id: id,
        IfMatch: distribution.ETag,
        DistributionConfig: {
          ...config,
          CallerReference: config.CallerReference,
          Enabled: false,
        },
      });
      await cloudfront.send(updateCommand);

      return NextResponse.json(
        {
          message:
            "Distribution is being disabled. Please try deleting again once it's disabled.",
        },
        { status: 202 },
      );
    }

    // Калі distribution выключаны, мы можам яго выдаліць
    const deleteCommand = new DeleteDistributionCommand({
      Id: id,
      IfMatch: distribution.ETag,
    });
    await cloudfront.send(deleteCommand);

    return NextResponse.json({
      message: 'Distribution deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CloudFront distribution:', error);
    return NextResponse.json(
      { error: 'Failed to delete CloudFront distribution' },
      { status: 500 },
    );
  }
}
