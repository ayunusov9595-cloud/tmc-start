import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);

    const source = await prisma.cvDocument.findUnique({
      where: { id: params.id },
    });

    if (!source) {
      return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 });
    }

    if (source.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const duplicated = await prisma.cvDocument.create({
      data: {
        userId: session.userId,
        title: `${source.title} (nusxa)`,
        templateId: source.templateId,
        status: 'DRAFT',
        isFavorite: false,
        personalInfo: source.personalInfo,
        summary: source.summary,
        educationData: source.educationData,
        experienceData: source.experienceData,
        projectsData: source.projectsData,
        skillsData: source.skillsData,
        languagesData: source.languagesData,
        certificatesData: source.certificatesData,
      },
    });

    return NextResponse.json({ cv: duplicated }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Nusxa olishda xatolik yuz berdi' }, { status: 500 });
  }
}
