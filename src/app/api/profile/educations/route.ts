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
// GET /api/profile/educations
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);

    const educations = await prisma.education.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ educations });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Ta'lim ma'lumotlarini yuklashda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/profile/educations
// ---------------------------------------------------------------------------

const createEducationSchema = z.object({
  institution: z.string().min(1, "Ta'lim muassasasi nomi kiritilishi kerak").max(200),
  degree: z.string().min(1, "Daraja kiritilishi kerak").max(100),
  fieldOfStudy: z.string().min(1, "O'quv yo'nalishi kiritilishi kerak").max(200),
  startYear: z.number().int().min(1990, "Yil 1990 dan katta bo'lishi kerak").max(2040),
  endYear: z.number().int().min(1990).max(2040).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = createEducationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const education = await prisma.education.create({
      data: {
        profileId,
        ...parsed.data,
      },
    });

    return NextResponse.json({ education }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Ta'lim ma'lumotini qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/profile/educations
// ---------------------------------------------------------------------------

const updateEducationSchema = createEducationSchema.partial().extend({
  id: z.string().min(1, 'ID talab qilinadi'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = updateEducationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, ...data } = parsed.data;

    const existing = await prisma.education.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ta'lim ma'lumoti topilmadi" }, { status: 404 });
    }

    const education = await prisma.education.update({
      where: { id },
      data,
    });

    return NextResponse.json({ education });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Ta'lim ma'lumotini yangilashda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/profile/educations?id=xxx
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

    const existing = await prisma.education.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ta'lim ma'lumoti topilmadi" }, { status: 404 });
    }

    await prisma.education.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Ta'lim ma'lumotini o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
