import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/projects – Search & filter published projects
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim();
    const category = searchParams.get('category');
    const stage = searchParams.get('stage');
    const workFormat = searchParams.get('workFormat');

    const where: any = {
      status: 'PUBLISHED',
    };

    if (category && category !== 'ALL') where.category = category;
    if (stage && stage !== 'ALL') where.stage = stage;
    if (workFormat && workFormat !== 'ALL') where.workFormat = workFormat;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { problem: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true },
        },
        roles: true,
        memberships: {
          select: { id: true, userId: true, role: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Loyihalarni yuklashda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects – Create a new project with roles
// ---------------------------------------------------------------------------
const createProjectSchema = z.object({
  title: z.string().min(3, "Loyiha nomi kamida 3 belgidan iborat bo'lishi kerak"),
  description: z.string().min(10, "Loyiha tavsifi kamida 10 belgidan iborat bo'lishi kerak"),
  problem: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  category: z.enum(['STARTUP', 'INNOVATION', 'RESEARCH', 'SOCIAL', 'HACKATHON']).default('STARTUP'),
  stage: z.enum(['IDEA', 'PLANNING', 'MVP', 'ACTIVE', 'COMPLETED']).default('IDEA'),
  weeklyHours: z.number().int().min(1).max(60).optional().nullable(),
  durationWeeks: z.number().int().min(1).max(100).optional().nullable(),
  workFormat: z.enum(['REMOTE', 'HYBRID', 'ONSITE', 'ANY']).default('ANY'),
  location: z.string().optional().nullable(),
  compensation: z.string().optional().nullable(),
  roles: z.array(
    z.object({
      title: z.string().min(2),
      description: z.string().optional().nullable(),
      skillsNeeded: z.string().optional().nullable(), // JSON string or comma-separated
      maxPlaces: z.number().int().min(1).default(1),
    }),
  ).min(1, "Kamida bitta rol ko'rsatilishi kerak"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Noto'g'ri ma'lumotlar" },
        { status: 400 },
      );
    }

    const { roles, ...projectData } = parsed.data;

    // Use transaction to create Project, Roles, and initial Owner Membership
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...projectData,
          ownerId: session.userId,
          status: 'PUBLISHED',
        },
      });

      // Create roles
      for (const r of roles) {
        await tx.projectRole.create({
          data: {
            projectId: project.id,
            title: r.title,
            description: r.description,
            skillsNeeded: r.skillsNeeded,
            maxPlaces: r.maxPlaces,
            filledPlaces: 0,
          },
        });
      }

      // Automatically add owner as team member
      await tx.membership.create({
        data: {
          projectId: project.id,
          userId: session.userId,
          role: 'Loyiha asoschisi (Owner)',
          isOwner: true,
        },
      });

      return project;
    });

    return NextResponse.json({ success: true, project: result }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: 'Loyiha yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}
