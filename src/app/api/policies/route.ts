import { checkApiAuth } from '@/lib/api-auth';
import { getPolicies } from '@/lib/server-api';
import { NextResponse } from 'next/server';

export async function GET() {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const policies = await getPolicies();
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error getting CloudFront policies:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Невядомая памылка' }, { status: 500 });
  }
}
