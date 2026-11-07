import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const memberships = await prisma.membership.findMany({
      where: { userId: session.userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            stage: true,
            category: true,
            status: true,
            workFormat: true,
            ownerId: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return NextResponse.json({ memberships });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Jamoalar ro‘yxatini olishda xatolik' }, { status: 500 });
  }
}
