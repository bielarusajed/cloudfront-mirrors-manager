import { checkApiAuth } from '@/lib/api-auth';
import { updateDistributionComments } from '@/lib/aws';
import { type NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkApiAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { comments } = await request.json();
    if (typeof comments !== 'string' || comments.length > 128)
      return NextResponse.json({ error: 'Нататка павінна змяшчаць не больш за 128 знакаў' }, { status: 400 });
    await updateDistributionComments(id, comments);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error updating CloudFront distribution comments:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Невядомая памылка' }, { status: 500 });
  }
}
