import { checkApiAuth } from '@/lib/api-auth';
import { getDistributions } from '@/lib/server-api';
import { NextResponse } from 'next/server';

export async function GET() {
  const authError = await checkApiAuth();
  if (authError) return authError;
  return NextResponse.json(await getDistributions());
}
