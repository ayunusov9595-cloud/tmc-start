import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TEMPLATE_CONFIGS } from '@/lib/cv-templates';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// GET /api/cv/[id] – Retrieve a single CV with ownership check
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const cv = await prisma.cvDocument.findUnique({
      where: { id: params.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 });
    }

    if (cv.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const template = TEMPLATE_CONFIGS.find((t) => t.id === cv.templateId) || TEMPLATE_CONFIGS[0];

    return NextResponse.json({
      cv,
      template,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'CV ma‘lumotini olishda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/cv/[id] – Update CV fields & autosave
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const existing = await prisma.cvDocument.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 });
    }

    if (existing.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const updateData: any = {
      lastAutoSavedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.templateId !== undefined) updateData.templateId = body.templateId;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite;

    if (body.personalInfo !== undefined) {
      updateData.personalInfo = typeof body.personalInfo === 'string' ? body.personalInfo : JSON.stringify(body.personalInfo);
    }
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.educationData !== undefined) {
      updateData.educationData = typeof body.educationData === 'string' ? body.educationData : JSON.stringify(body.educationData);
    }
    if (body.experienceData !== undefined) {
      updateData.experienceData = typeof body.experienceData === 'string' ? body.experienceData : JSON.stringify(body.experienceData);
    }
    if (body.projectsData !== undefined) {
      updateData.projectsData = typeof body.projectsData === 'string' ? body.projectsData : JSON.stringify(body.projectsData);
    }
    if (body.skillsData !== undefined) {
      updateData.skillsData = typeof body.skillsData === 'string' ? body.skillsData : JSON.stringify(body.skillsData);
    }
    if (body.languagesData !== undefined) {
      updateData.languagesData = typeof body.languagesData === 'string' ? body.languagesData : JSON.stringify(body.languagesData);
    }
    if (body.certificatesData !== undefined) {
      updateData.certificatesData = typeof body.certificatesData === 'string' ? body.certificatesData : JSON.stringify(body.certificatesData);
    }

    const updated = await prisma.cvDocument.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ cv: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'CV-ni saqlashda xatolik yuz berdi' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/cv/[id] – Delete CV
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);

    const existing = await prisma.cvDocument.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 });
    }

    if (existing.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    await prisma.cvDocument.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'CV muvaffaqiyatli o‘chirildi' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'O‘chirishda xatolik yuz berdi' }, { status: 500 });
  }
}
