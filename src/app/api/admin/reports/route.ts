import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN']);

    const reports = await prisma.moderationReport.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true, status: true, ownerId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Shikoyatlarni olishda xatolik' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(request, ['ADMIN']);
    const body = await request.json();
    const { reportId, status, closeProject } = body;

    const report = await prisma.moderationReport.findUnique({
      where: { id: reportId },
      include: { project: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Shikoyat topilmadi' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.moderationReport.update({
        where: { id: reportId },
        data: { status },
      });

      if (closeProject && report.projectId) {
        await tx.project.update({
          where: { id: report.projectId },
          data: { status: 'CLOSED' },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'MODERATION_ACTION',
          entityType: 'PROJECT',
          entityId: report.projectId || reportId,
          details: `Shikoyat ko‘rib chiqildi. Holat: ${status}. Loyiha yopildi: ${closeProject ? 'Ha' : 'Yo‘q'}`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Moderatsiya amalini bajarishda xatolik' }, { status: 500 });
  }
}
