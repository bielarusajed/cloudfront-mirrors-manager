import { checkApiAuth } from '@/lib/api-auth';
import { getDistributions } from '@/lib/server-api';
import { NextResponse } from 'next/server';

export async function GET() {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const response = await getDistributions();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return NextResponse.json({ error: 'Не атрымалася атрымаць distributions' }, { status: 500 });
  }
}
