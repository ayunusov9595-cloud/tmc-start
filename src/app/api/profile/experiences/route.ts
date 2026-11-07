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
// GET /api/profile/experiences
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);

    const experiences = await prisma.experience.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Tajribalarni yuklashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/profile/experiences
// ---------------------------------------------------------------------------

const createExperienceSchema = z.object({
  category: z.enum(['EMPLOYMENT', 'INTERNSHIP', 'VOLUNTEERING'], {
    required_error: 'Kategoriya talab qilinadi',
  }),
  title: z.string().min(1, 'Lavozim nomi kiritilishi kerak').max(200),
  organization: z.string().min(1, 'Tashkilot nomi kiritilishi kerak').max(200),
  startDate: z.string().min(1, "Boshlanish sanasi kiritilishi kerak"),
  endDate: z.string().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = createExperienceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const experience = await prisma.experience.create({
      data: {
        profileId,
        ...parsed.data,
      },
    });

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Tajribani qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/profile/experiences
// ---------------------------------------------------------------------------

const updateExperienceSchema = createExperienceSchema.partial().extend({
  id: z.string().min(1, 'ID talab qilinadi'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = updateExperienceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, ...data } = parsed.data;

    // Verify ownership
    const existing = await prisma.experience.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tajriba topilmadi' }, { status: 404 });
    }

    const experience = await prisma.experience.update({
      where: { id },
      data,
    });

    return NextResponse.json({ experience });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Tajribani yangilashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/profile/experiences?id=xxx
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

    const existing = await prisma.experience.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tajriba topilmadi' }, { status: 404 });
    }

    await prisma.experience.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Tajribani o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
