import { checkApiAuth } from '@/lib/api-auth';
import { getPolicies } from '@/lib/server-api';
import { NextResponse } from 'next/server';

export async function GET() {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const response = await getPolicies();
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Не атрымалася атрымаць палітыкі' },
      { status: 500 },
    );
  }
}
