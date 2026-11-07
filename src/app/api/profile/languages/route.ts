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
// GET /api/profile/languages
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);

    const languages = await prisma.profileLanguage.findMany({
      where: { profileId },
      orderBy: { language: 'asc' },
    });

    return NextResponse.json({ languages });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Tillarni yuklashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/profile/languages
// ---------------------------------------------------------------------------

const createLanguageSchema = z.object({
  language: z.string().min(1, 'Til nomi kiritilishi kerak').max(100),
  proficiency: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVE']).default('B1'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = createLanguageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const language = await prisma.profileLanguage.create({
      data: {
        profileId,
        ...parsed.data,
      },
    });

    return NextResponse.json({ language }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Tilni qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/profile/languages?id=xxx
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

    const language = await prisma.profileLanguage.findFirst({
      where: { id, profileId },
    });

    if (!language) {
      return NextResponse.json({ error: 'Til topilmadi' }, { status: 404 });
    }

    await prisma.profileLanguage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Tilni o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
