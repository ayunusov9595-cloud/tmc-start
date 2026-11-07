import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// GET /api/projects/[id] – Project detail
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { searchParams } = new URL(request.url);

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        roles: true,
        memberships: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    // Attach public profile information for members if allowed by privacy settings
    const memberProfiles = await Promise.all(
      project.memberships.map(async (m) => {
        const prof = await prisma.profile.findUnique({
          where: { userId: m.userId },
          select: {
            fullName: true,
            institution: true,
            studyField: true,
            courseYear: true,
            publicBio: true,
            publicSkills: true,
            bio: true,
            skills: { select: { name: true, proficiency: true } },
          },
        });

        return {
          ...m,
          profile: prof
            ? {
                fullName: prof.fullName,
                institution: prof.institution,
                studyField: prof.studyField,
                courseYear: prof.courseYear,
                bio: prof.publicBio ? prof.bio : null,
                skills: prof.publicSkills ? prof.skills : [],
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      project: {
        ...project,
        memberships: memberProfiles,
      },
    });
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Loyiha ma‘lumotlarini yuklashda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/[id] – Update project details
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const existing = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    if (existing.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        problem: body.problem !== undefined ? body.problem : existing.problem,
        outcome: body.outcome !== undefined ? body.outcome : existing.outcome,
        category: body.category !== undefined ? body.category : existing.category,
        stage: body.stage !== undefined ? body.stage : existing.stage,
        weeklyHours: body.weeklyHours !== undefined ? body.weeklyHours : existing.weeklyHours,
        durationWeeks: body.durationWeeks !== undefined ? body.durationWeeks : existing.durationWeeks,
        workFormat: body.workFormat !== undefined ? body.workFormat : existing.workFormat,
        location: body.location !== undefined ? body.location : existing.location,
        compensation: body.compensation !== undefined ? body.compensation : existing.compensation,
        status: body.status !== undefined ? body.status : existing.status,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Loyiha ma‘lumotlarini yangilashda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[id] – Close or delete project
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);

    const existing = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    if (existing.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat yo‘q' }, { status: 403 });
    }

    // Instead of hard deleting and breaking relations, set status to CLOSED
    await prisma.project.update({
      where: { id: params.id },
      data: { status: 'CLOSED' },
    });

    return NextResponse.json({ success: true, message: 'Loyiha muvaffaqiyatli yopildi' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Loyihani yopishda xatolik' }, { status: 500 });
  }
}
