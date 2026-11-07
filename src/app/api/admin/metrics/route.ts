import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['ADMIN']);

    const [
      totalStudents,
      totalCvs,
      totalProjects,
      pendingReports,
      totalReviews,
      totalVoiceJobs,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.cvDocument.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.moderationReport.count({ where: { status: 'PENDING' } }),
      prisma.cvReview.count(),
      prisma.voiceJob.count(),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalStudents,
        totalCvs,
        totalProjects,
        pendingReports,
        totalReviews,
        totalVoiceJobs,
      },
      recentAuditLogs,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Statistikani yuklashda xatolik' }, { status: 500 });
  }
}
