import { NextResponse } from 'next/server';
import { isAuthenticated } from './auth';

export async function checkApiAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: 'Неабходна аўтарызацыя' },
      { status: 401 },
    );
  }
  return null;
}
