import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TEMPLATE_CONFIGS } from '@/lib/cv-templates';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/cv – List current user's CVs
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const cvs = await prisma.cvDocument.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        isFavorite: true,
        templateId: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    // Attach template metadata
    const enriched = cvs.map((cv) => {
      const template = TEMPLATE_CONFIGS.find((t) => t.id === cv.templateId);
      return {
        ...cv,
        template: template
          ? { name: template.name, family: template.family, variant: template.variant }
          : { name: 'Klassik Minimal', family: 'minimal', variant: 'slate' },
      };
    });

    return NextResponse.json({ cvs: enriched });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'CV ro‘yxatini olishda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/cv – Create a new CV document
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json().catch(() => ({}));

    const title = body.title?.trim() || 'Mening yangi rezyumem';
    const templateId = body.templateId || TEMPLATE_CONFIGS[0]?.id || 'minimal-classic-burgundy';

    // Check if user has an existing profile to prepopulate
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
      include: {
        skills: true,
        languages: true,
        educations: true,
        experiences: true,
        profileProjects: true,
        certificates: true,
      },
    });

    const personalInfo = {
      fullName: profile?.fullName || session.name,
      email: session.email,
      phone: profile?.phone || '',
      city: profile?.city || 'Toshkent',
      photoUrl: profile?.photoUrl || '',
      linkedinUrl: profile?.linkedinUrl || '',
      githubUrl: profile?.githubUrl || '',
      portfolioUrl: profile?.portfolioUrl || '',
    };

    const summary = profile?.bio || '';

    const educationData = profile?.educations?.length
      ? profile.educations.map((e) => ({
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          startYear: e.startYear,
          endYear: e.endYear,
          description: e.description || '',
        }))
      : [
          {
            institution: profile?.institution || 'TMC Institute',
            degree: profile?.qualification || 'Bakalavr',
            fieldOfStudy: profile?.studyField || 'Axborot texnologiyalari',
            startYear: 2022,
            endYear: 2026,
            description: '',
          },
        ];

    const experienceData = profile?.experiences?.length
      ? profile.experiences.map((exp) => ({
          title: exp.title,
          organization: exp.organization,
          category: exp.category,
          startDate: exp.startDate,
          endDate: exp.endDate || '',
          description: exp.description || '',
        }))
      : [];

    const projectsData = profile?.profileProjects?.length
      ? profile.profileProjects.map((p) => ({
          title: p.title,
          description: p.description || '',
          url: p.url || '',
          technologies: p.technologies || '',
        }))
      : [];

    const skillsData = profile?.skills?.length
      ? profile.skills.map((s) => ({
          name: s.name,
          category: s.category || 'Asosiy',
          proficiency: s.proficiency || 'INTERMEDIATE',
        }))
      : [];

    const languagesData = profile?.languages?.length
      ? profile.languages.map((l) => ({
          language: l.language,
          proficiency: l.proficiency || 'B1',
        }))
      : [{ language: "O'zbek", proficiency: 'NATIVE' }];

    const certificatesData = profile?.certificates?.length
      ? profile.certificates.map((c) => ({
          title: c.title,
          issuer: c.issuer || '',
          date: c.date || '',
          url: c.url || '',
        }))
      : [];

    const newCv = await prisma.cvDocument.create({
      data: {
        userId: session.userId,
        title,
        templateId,
        status: 'DRAFT',
        personalInfo: JSON.stringify(personalInfo),
        summary,
        educationData: JSON.stringify(educationData),
        experienceData: JSON.stringify(experienceData),
        projectsData: JSON.stringify(projectsData),
        skillsData: JSON.stringify(skillsData),
        languagesData: JSON.stringify(languagesData),
        certificatesData: JSON.stringify(certificatesData),
      },
    });

    return NextResponse.json({ cv: newCv }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/cv error:', error);
    return NextResponse.json({ error: 'CV yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}
