import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const { reason, details } = body;

    if (!reason || reason.trim().length < 3) {
      return NextResponse.json({ error: 'Shikoyat sababi ko‘rsatilishi shart' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    const report = await prisma.moderationReport.create({
      data: {
        reporterId: session.userId,
        projectId: params.id,
        reason: reason.trim(),
        details: details?.trim() || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Shikoyat Career Center ma‘muriyatiga yuborildi',
      reportId: report.id,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Shikoyat yuborishda xatolik yuz berdi' }, { status: 500 });
  }
}
