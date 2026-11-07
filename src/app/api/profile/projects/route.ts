import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helper: get or create profile
// ---------------------------------------------------------------------------

async function getProfileId(userId: string, userName: string): Promise<string> {
  let profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId, fullName: userName },
      select: { id: true },
    });
  }

  return profile.id;
}

// ---------------------------------------------------------------------------
// GET /api/profile/projects
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);

    const projects = await prisma.profileProject.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Loyihalarni yuklashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/profile/projects
// ---------------------------------------------------------------------------

const createProjectSchema = z.object({
  title: z.string().min(1, 'Loyiha nomi kiritilishi kerak').max(200),
  description: z.string().max(2000).optional().nullable(),
  url: z.string().url("Noto'g'ri havola formati").or(z.literal('')).optional().nullable(),
  technologies: z.string().optional().nullable(), // JSON string
  category: z.enum(['EDUCATIONAL', 'PERSONAL', 'FREELANCE']).default('EDUCATIONAL'),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const data = { ...parsed.data };
    if (data.url === '') data.url = null;

    const project = await prisma.profileProject.create({
      data: {
        profileId,
        ...data,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Loyihani qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/profile/projects
// ---------------------------------------------------------------------------

const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().min(1, 'ID talab qilinadi'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, ...data } = parsed.data;
    if (data.url === '') data.url = null;

    const existing = await prisma.profileProject.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    const project = await prisma.profileProject.update({
      where: { id },
      data,
    });

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Loyihani yangilashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/profile/projects?id=xxx
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID talab qilinadi' }, { status: 400 });
    }

    const existing = await prisma.profileProject.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Loyiha topilmadi' }, { status: 404 });
    }

    await prisma.profileProject.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Loyihani o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
