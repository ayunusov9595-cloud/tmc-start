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
// GET /api/profile/certificates
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);

    const certificates = await prisma.certificate.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Sertifikatlarni yuklashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/profile/certificates
// ---------------------------------------------------------------------------

const createCertificateSchema = z.object({
  title: z.string().min(1, 'Sertifikat nomi kiritilishi kerak').max(200),
  issuer: z.string().max(200).optional().nullable(),
  date: z.string().optional().nullable(),
  url: z.string().url("Noto'g'ri havola formati").or(z.literal('')).optional().nullable(),
  category: z.enum(['CERTIFICATE', 'ACHIEVEMENT', 'AWARD']).default('CERTIFICATE'),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = createCertificateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const data = { ...parsed.data };
    if (data.url === '') data.url = null;

    const certificate = await prisma.certificate.create({
      data: {
        profileId,
        ...data,
      },
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Sertifikatni qo'shishda xatolik" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/profile/certificates
// ---------------------------------------------------------------------------

const updateCertificateSchema = createCertificateSchema.partial().extend({
  id: z.string().min(1, 'ID talab qilinadi'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const profileId = await getProfileId(session.userId, session.name);
    const body = await request.json();

    const parsed = updateCertificateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id, ...data } = parsed.data;
    if (data.url === '') data.url = null;

    const existing = await prisma.certificate.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sertifikat topilmadi' }, { status: 404 });
    }

    const certificate = await prisma.certificate.update({
      where: { id },
      data,
    });

    return NextResponse.json({ certificate });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Sertifikatni yangilashda xatolik' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/profile/certificates?id=xxx
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

    const existing = await prisma.certificate.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sertifikat topilmadi' }, { status: 404 });
    }

    await prisma.certificate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Sertifikatni o'chirishda xatolik" },
      { status: 500 },
    );
  }
}
