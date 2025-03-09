import { checkApiAuth } from '@/lib/api-auth';
import { updateDistributionComments } from '@/lib/aws';
import { type NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkApiAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    const { comments } = await request.json();
    const result = await updateDistributionComments(id, comments);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({});
  } catch (error) {
    console.error('Error updating distribution comments:', error);
    return NextResponse.json({ error: 'Не атрымалася абнавіць тэгі distribution' }, { status: 500 });
  }
}
