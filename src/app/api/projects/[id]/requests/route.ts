import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/requests – List join requests (Owner only)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    if (project.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const requests = await prisma.joinRequest.findMany({
      where: { projectId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Attach role title & student profile summary
    const enriched = await Promise.all(
      requests.map(async (r) => {
        let roleTitle = 'Umumiy ishtirokchi';
        if (r.roleId) {
          const role = await prisma.projectRole.findUnique({ where: { id: r.roleId } });
          if (role) roleTitle = role.title;
        }

        const profile = await prisma.profile.findUnique({
          where: { userId: r.userId },
          select: {
            fullName: true,
            institution: true,
            studyField: true,
            courseYear: true,
            bio: true,
            skills: { select: { name: true } },
          },
        });

        return {
          ...r,
          roleTitle,
          profile,
        };
      }),
    );

    return NextResponse.json({ requests: enriched });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'So‘rovlarni olishda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects/[id]/requests – Submit request to join a project
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const { roleId, introduction } = body;

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { roles: true },
    });

    if (!project || project.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Loyiha faol emas yoki topilmadi' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.membership.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: session.userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Siz allaqachon ushbu jamoa a‘zosisiz' },
        { status: 400 },
      );
    }

    // Check if user already submitted a request
    const existingReq = await prisma.joinRequest.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: session.userId,
        },
      },
    });

    if (existingReq && existingReq.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Siz allaqachon ushbu loyihaga a‘zolik so‘rovi yuborgansiz' },
        { status: 400 },
      );
    }

    // Check role capacity if roleId is supplied
    if (roleId) {
      const targetRole = project.roles.find((r) => r.id === roleId);
      if (targetRole && targetRole.filledPlaces >= targetRole.maxPlaces) {
        return NextResponse.json(
          { error: 'Ushbu rol uchun barcha o‘rinlar to‘lgan' },
          { status: 400 },
        );
      }
    }

    // Upsert join request
    const joinReq = await prisma.joinRequest.upsert({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: session.userId,
        },
      },
      create: {
        projectId: params.id,
        userId: session.userId,
        roleId: roleId || null,
        introduction: introduction?.trim() || null,
        status: 'PENDING',
      },
      update: {
        roleId: roleId || null,
        introduction: introduction?.trim() || null,
        status: 'PENDING',
      },
    });

    // Send in-app notification to project owner
    await prisma.notification.create({
      data: {
        userId: project.ownerId,
        title: 'Yangi jamoa so‘rovi',
        message: `${session.name} "${project.title}" loyihangizga qo‘shilish so‘rovini yubordi.`,
        link: `/projects/${project.id}`,
        type: 'PROJECT_REQUEST',
      },
    });

    return NextResponse.json({ success: true, request: joinReq }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST joinRequest error:', error);
    return NextResponse.json({ error: 'So‘rov yuborishda xatolik yuz berdi' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[id]/requests – Withdraw request
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);

    const existingReq = await prisma.joinRequest.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: session.userId,
        },
      },
    });

    if (!existingReq || existingReq.status !== 'PENDING') {
      return NextResponse.json({ error: 'Kutilayotgan so‘rov topilmadi' }, { status: 404 });
    }

    await prisma.joinRequest.update({
      where: { id: existingReq.id },
      data: { status: 'WITHDRAWN' },
    });

    return NextResponse.json({ success: true, message: 'So‘rov qaytarib olindi' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'So‘rovni bekor qilishda xatolik' }, { status: 500 });
  }
}
