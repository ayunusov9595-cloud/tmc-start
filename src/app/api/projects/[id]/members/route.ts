import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/members – List members
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const members = await prisma.membership.findMany({
      where: { projectId: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: 'A‘zolarni olishda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[id]/members – Leave team or remove member
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || session.userId;

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    const isSelfLeaving = targetUserId === session.userId;
    const isOwner = project.ownerId === session.userId;

    // Permissions check
    if (!isSelfLeaving && !isOwner && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Boshqa a‘zoni chiqarishga ruxsat yo‘q' }, { status: 403 });
    }

    // Owner cannot simply leave their own project
    if (isSelfLeaving && isOwner) {
      return NextResponse.json(
        {
          error:
            'Loyiha egasi jamoani tark eta olmaydi. Avval loyiha egaligini boshqa a‘zoga topshiring yoki loyihani yoping.',
        },
        { status: 400 },
      );
    }

    // Find membership
    const membership = await prisma.membership.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: targetUserId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'A‘zo topilmadi' }, { status: 404 });
    }

    await prisma.membership.delete({
      where: { id: membership.id },
    });

    // Notify removed user if removed by owner
    if (!isSelfLeaving) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Jamoa tarkibi o‘zgarishi',
          message: `Siz "${project.title}" loyihasi a‘zoligidan chiqarildingiz.`,
          link: `/projects/${project.id}`,
          type: 'SYSTEM',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isSelfLeaving ? 'Siz jamoani tark etdingiz' : 'A‘zo jamoa tarkibidan chiqarildi',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Amalni bajarishda xatolik yuz berdi' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/[id]/members – Transfer project ownership
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json({ error: 'Yangi loyiha egasi ko‘rsatilmadi' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    if (project.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Faqat loyiha egasi egalikni topshirishi mumkin' }, { status: 403 });
    }

    // Check that target is an existing member
    const targetMember = await prisma.membership.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: newOwnerId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Yangi loyiha egasi avval jamoa a‘zosi bo‘lishi kerak' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update project ownerId
      await tx.project.update({
        where: { id: params.id },
        data: { ownerId: newOwnerId },
      });

      // 2. Demote old owner's membership
      await tx.membership.updateMany({
        where: { projectId: params.id, userId: session.userId },
        data: { isOwner: false },
      });

      // 3. Promote new owner's membership
      await tx.membership.updateMany({
        where: { projectId: params.id, userId: newOwnerId },
        data: { isOwner: true, role: 'Loyiha asoschisi (Owner)' },
      });

      // 4. Send notification
      await tx.notification.create({
        data: {
          userId: newOwnerId,
          title: 'Loyiha egaligi topshirildi 👑',
          message: `Sizga "${project.title}" loyihasining to‘liq egalik huquqi topshirildi.`,
          link: `/projects/${project.id}`,
          type: 'SYSTEM',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Loyiha egaligi muvaffaqiyatli topshirildi' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Egalikni topshirishda xatolik yuz berdi' }, { status: 500 });
  }
}
