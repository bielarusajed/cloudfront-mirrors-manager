import { checkApiAuth } from '@/lib/api-auth';
import { getDistributionStatus } from '@/lib/aws';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const status = await getDistributionStatus(id);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error getting CloudFront distribution status:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Невядомая памылка' }, { status: 500 });
  }
}
