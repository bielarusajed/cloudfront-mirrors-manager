import { checkApiAuth } from '@/lib/api-auth';
import { createDistribution } from '@/lib/aws';
import { createDistributionBatch } from '@/lib/create-distribution-batch';
import { getDistributions } from '@/lib/server-api';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function GET() {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const distributions = await getDistributions();
    return NextResponse.json(distributions);
  } catch (error) {
    console.error('Error getting CloudFront distributions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Невядомая памылка' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkApiAuth();
  if (authError) return authError;
  try {
    const result = await createDistributionBatch(await request.json(), createDistribution);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : 'Не атрымалася стварыць люстэркі';
    return NextResponse.json(
      { error: message },
      { status: error instanceof ZodError || error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
