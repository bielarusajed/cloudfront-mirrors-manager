import { checkApiAuth } from '@/lib/api-auth';
import { deleteDistribution, disableDistribution, enableDistribution } from '@/lib/aws';
import { NextResponse } from 'next/server';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const authError = await checkApiAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await request.json();
    const enabled = body?.enabled;
    if (typeof enabled !== 'boolean') return NextResponse.json({ error: 'Няправільны стан люстэрка' }, { status: 400 });
    await (enabled ? enableDistribution(id) : disableDistribution(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не атрымалася змяніць стан' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const authError = await checkApiAuth();
  if (authError) return authError;
  try {
    await deleteDistribution((await params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не атрымалася выдаліць люстэрка' },
      { status: 500 },
    );
  }
}
