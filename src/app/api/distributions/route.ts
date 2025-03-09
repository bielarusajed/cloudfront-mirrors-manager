import { checkApiAuth } from '@/lib/api-auth';
import { getDistributions } from '@/lib/server-api';
import { NextResponse } from 'next/server';

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
