import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getAiAdapter, isAiConfigured, CareerRecommendation } from '@/lib/ai-adapter';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/career – List past career sessions for current user
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const sessions = await prisma.careerSession.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Karyera sessiyalarini olishda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/career – Generate career recommendations
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const { inputType, inputText, cvDocumentId } = body;
    // inputType: 'BIOGRAPHY' | 'PROFILE' | 'CV'

    let contextText = '';

    if (inputType === 'PROFILE') {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.userId },
        include: {
          skills: true,
          languages: true,
          educations: true,
          experiences: true,
          profileProjects: true,
        },
      });

      if (!profile) {
        return NextResponse.json({ error: 'Foydalanuvchi profili topilmadi' }, { status: 404 });
      }

      contextText = `
        Talaba: ${profile.fullName}
        Institut: ${profile.institution || 'TMC Institute'}
        Yo'nalish: ${profile.studyField || ''}
        Kurs: ${profile.courseYear || ''}-kurs (${profile.graduationStatus || 'O\'qimoqda'})
        Qisqa bio: ${profile.bio || ''}
        Ko'nikmalar: ${profile.skills.map((s) => `${s.name} (${s.proficiency})`).join(', ')}
        Tillar: ${profile.languages.map((l) => `${l.language} (${l.proficiency})`).join(', ')}
        Tajriba: ${profile.experiences.map((e) => `${e.title} @ ${e.organization}`).join(', ')}
        Loyihalar: ${profile.profileProjects.map((p) => p.title).join(', ')}
        Qiziqishlar: ${profile.careerInterests || ''}
        Ish formati: ${profile.preferredWorkFormat || ''}
      `;
    } else if (inputType === 'CV') {
      if (!cvDocumentId) {
        return NextResponse.json({ error: 'cvDocumentId talab qilinadi' }, { status: 400 });
      }

      const cv = await prisma.cvDocument.findUnique({
        where: { id: cvDocumentId },
      });

      if (!cv || (cv.userId !== session.userId && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 });
      }

      contextText = `
        CV sarlavhasi: ${cv.title}
        Xulosa: ${cv.summary || ''}
        Ta'lim: ${cv.educationData || ''}
        Tajriba: ${cv.experienceData || ''}
        Loyihalar: ${cv.projectsData || ''}
        Ko'nikmalar: ${cv.skillsData || ''}
        Tillar: ${cv.languagesData || ''}
      `;
    } else {
      // BIOGRAPHY
      if (!inputText || inputText.trim().length < 20) {
        return NextResponse.json(
          { error: 'Iltimos, o‘zingiz haqingizda kamida 20 ta belgidan iborat matn kiriting' },
          { status: 400 },
        );
      }
      contextText = inputText;
    }

    // Create session record
    const careerSession = await prisma.careerSession.create({
      data: {
        userId: session.userId,
        inputType: inputType || 'BIOGRAPHY',
        inputText: contextText.slice(0, 1000),
        cvDocumentId: cvDocumentId || null,
        status: 'PROCESSING',
      },
    });

    const adapter = getAiAdapter();
    const isConfigured = isAiConfigured();

    try {
      const recommendations: CareerRecommendation[] = await adapter.extractCareerGuidance(contextText);

      const updated = await prisma.careerSession.update({
        where: { id: careerSession.id },
        data: {
          recommendationsJson: JSON.stringify(recommendations),
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        success: true,
        isAiConfigured: isConfigured,
        session: updated,
        recommendations,
        notice: isConfigured
          ? undefined
          : 'Haqiqiy GEMINI_API_KEY sozlanmaganligi sababli namunaviy (mock) kasb tavsiyalari berildi.',
      });
    } catch (procErr: any) {
      console.error('Career guidance error:', procErr);
      await prisma.careerSession.update({
        where: { id: careerSession.id },
        data: {
          status: 'FAILED',
          errorMessage: procErr.message,
        },
      });

      return NextResponse.json(
        { error: 'Kasb tavsiyalarini shakllantirishda xatolik yuz berdi' },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 });
  }
}
