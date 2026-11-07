import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string; requestId: string };
}

// ---------------------------------------------------------------------------
// PUT /api/projects/[id]/requests/[requestId] – Accept or reject join request
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const { action } = body; // 'ACCEPT' | 'REJECT'

    if (action !== 'ACCEPT' && action !== 'REJECT') {
      return NextResponse.json({ error: "Noto'g'ri amal (faqat ACCEPT yoki REJECT)" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { roles: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    if (project.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    const joinReq = await prisma.joinRequest.findUnique({
      where: { id: params.requestId },
      include: { user: true },
    });

    if (!joinReq || joinReq.projectId !== params.id) {
      return NextResponse.json({ error: 'So‘rov topilmadi' }, { status: 404 });
    }

    if (joinReq.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Ushbu so‘rov allaqachon ko‘rib chiqilgan (${joinReq.status})` },
        { status: 400 },
      );
    }

    if (action === 'REJECT') {
      await prisma.joinRequest.update({
        where: { id: joinReq.id },
        data: { status: 'REJECTED' },
      });

      await prisma.notification.create({
        data: {
          userId: joinReq.userId,
          title: 'So‘rov rad etildi',
          message: `"${project.title}" loyihasiga so‘rovingiz loyiha egasi tomonidan rad etildi.`,
          link: `/projects/${project.id}`,
          type: 'SYSTEM',
        },
      });

      return NextResponse.json({ success: true, message: 'So‘rov rad etildi' });
    }

    // ACTION: ACCEPT
    // Atomic transaction preventing role overbooking and race conditions
    const result = await prisma.$transaction(async (tx) => {
      let roleTitle = 'Jamoa a‘zosi';

      if (joinReq.roleId) {
        const role = await tx.projectRole.findUnique({
          where: { id: joinReq.roleId },
        });

        if (!role) {
          throw new Error('Tanlangan rol topilmadi');
        }

        if (role.filledPlaces >= role.maxPlaces) {
          throw new Error('Ushbu rol uchun o‘rinlar to‘lib bo‘lgan');
        }

        roleTitle = role.title;

        // Increment filledPlaces
        await tx.projectRole.update({
          where: { id: role.id },
          data: { filledPlaces: { increment: 1 } },
        });
      }

      // Check if user is already a member
      const existing = await tx.membership.findUnique({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: joinReq.userId,
          },
        },
      });

      if (!existing) {
        await tx.membership.create({
          data: {
            projectId: project.id,
            userId: joinReq.userId,
            role: roleTitle,
            isOwner: false,
          },
        });
      }

      // Update join request status
      const updatedReq = await tx.joinRequest.update({
        where: { id: joinReq.id },
        data: { status: 'ACCEPTED' },
      });

      // Send notification to accepted student
      await tx.notification.create({
        data: {
          userId: joinReq.userId,
          title: 'Tabriklaymiz! Jamoaga qabul qilindingiz 🎉',
          message: `Siz "${project.title}" loyihasiga "${roleTitle}" sifatida qabul qilindingiz!`,
          link: `/projects/${project.id}`,
          type: 'PROJECT_ACCEPTED',
        },
      });

      return updatedReq;
    });

    return NextResponse.json({ success: true, request: result });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Accept/reject error:', error);
    return NextResponse.json(
      { error: error.message || 'So‘rovni ko‘rib chiqishda xatolik yuz berdi' },
      { status: 400 },
    );
  }
}
