import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// GET /api/profile – Return current user's full profile
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: {
        skills: true,
        languages: true,
        experiences: { orderBy: { sortOrder: 'asc' } },
        educations: { orderBy: { sortOrder: 'asc' } },
        certificates: { orderBy: { sortOrder: 'asc' } },
        profileProjects: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!profile) {
      // Auto-create a profile for the user
      const newProfile = await prisma.profile.create({
        data: {
          userId: session.userId,
          fullName: session.name,
        },
        include: {
          skills: true,
          languages: true,
          experiences: { orderBy: { sortOrder: 'asc' } },
          educations: { orderBy: { sortOrder: 'asc' } },
          certificates: { orderBy: { sortOrder: 'asc' } },
          profileProjects: { orderBy: { sortOrder: 'asc' } },
        },
      });

      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Profilni yuklashda xatolik yuz berdi' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/profile – Update profile fields
// ---------------------------------------------------------------------------

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "To'liq ism kamida 2 belgidan iborat bo'lishi kerak").optional(),
  phone: z.string().max(20, "Telefon raqami juda uzun").optional().nullable(),
  photoUrl: z.string().url("Noto'g'ri havola formati").optional().nullable(),
  city: z.string().max(100, "Shahar nomi juda uzun").optional().nullable(),
  bio: z.string().max(1000, "Bio matni juda uzun (maks. 1000 belgi)").optional().nullable(),

  // Education
  institution: z.string().max(200).optional().nullable(),
  studyField: z.string().max(200).optional().nullable(),
  qualification: z.string().optional().nullable(),
  courseYear: z.number().int().min(1).max(8).optional().nullable(),
  graduationStatus: z.enum(['STUDYING', 'GRADUATED', 'GAP_YEAR']).optional().nullable(),

  // Relevant subjects
  relevantSubjects: z.string().optional().nullable(), // JSON array

  // Career preferences
  careerInterests: z.string().optional().nullable(), // JSON array
  preferredWorkFormat: z.enum(['REMOTE', 'HYBRID', 'ONSITE', 'ANY']).optional().nullable(),
  availability: z.enum(['IMMEDIATE', 'PART_TIME', 'FULL_TIME', 'SUMMER']).optional().nullable(),

  // Portfolio links
  linkedinUrl: z.string().url("Noto'g'ri LinkedIn havola").or(z.literal('')).optional().nullable(),
  githubUrl: z.string().url("Noto'g'ri GitHub havola").or(z.literal('')).optional().nullable(),
  portfolioUrl: z.string().url("Noto'g'ri portfolio havola").or(z.literal('')).optional().nullable(),

  // Privacy
  publicBio: z.boolean().optional(),
  publicSkills: z.boolean().optional(),
  publicProjects: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: firstError.message, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Clean up empty strings for URL fields
    const data = { ...parsed.data };
    if (data.linkedinUrl === '') data.linkedinUrl = null;
    if (data.githubUrl === '') data.githubUrl = null;
    if (data.portfolioUrl === '') data.portfolioUrl = null;

    // Ensure profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: session.userId,
          fullName: session.name,
          ...data,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { userId: session.userId },
        data,
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: 'Profilni yangilashda xatolik yuz berdi' },
      { status: 500 },
    );
  }
}
