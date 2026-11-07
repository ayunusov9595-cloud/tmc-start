import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { saveFile, ALLOWED_CV_TYPES, MAX_CV_SIZE } from '@/lib/storage';
import { getAiAdapter, isAiConfigured } from '@/lib/ai-adapter';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// GET /api/cv-review – List all CV reviews for current user
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const reviews = await prisma.cvReview.findMany({
      where: { userId: session.userId },
      include: {
        cvDocument: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Tahlillarni olishda xatolik' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/cv-review – Create a new CV review
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const contentType = request.headers.get('content-type') || '';

    let cvDocumentId: string | null = null;
    let targetRole: string | null = null;
    let vacancyText: string | null = null;
    let cvTextToAnalyze = '';

    if (contentType.includes('multipart/form-data')) {
      // Uploaded CV file (PDF/DOCX)
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      targetRole = (formData.get('targetRole') as string) || null;
      vacancyText = (formData.get('vacancyText') as string) || null;

      if (!file) {
        return NextResponse.json({ error: 'Fayl taqdim etilmadi' }, { status: 400 });
      }

      if (file.size > MAX_CV_SIZE) {
        return NextResponse.json(
          { error: `Fayl hajmi 10MB dan oshmasligi kerak` },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileKey = await saveFile(buffer, file.name, 'cvs');

      // Extract raw text from file
      cvTextToAnalyze = buffer.toString('utf-8').replace(/[^\x20-\x7E\u0400-\u04FF\u0100-\u024F\n]/g, ' ');
      if (cvTextToAnalyze.length < 50) {
        cvTextToAnalyze = `Fayl nomi: ${file.name}. Hajmi: ${file.size} bayt. Matn namunasi: Talaba rezyumesi.`;
      }

      // Create a CvDocument for the uploaded file so it becomes part of platform CVs
      const newDoc = await prisma.cvDocument.create({
        data: {
          userId: session.userId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          uploadedFileName: file.name,
          uploadedFileKey: fileKey,
          uploadedFileSize: file.size,
          uploadedFileType: file.type,
          extractedText: cvTextToAnalyze,
          personalInfo: JSON.stringify({ fullName: session.name, email: session.email }),
          summary: cvTextToAnalyze.slice(0, 300),
          status: 'DRAFT',
        },
      });

      cvDocumentId = newDoc.id;
    } else {
      // Platform CV selected
      const body = await request.json();
      cvDocumentId = body.cvDocumentId;
      targetRole = body.targetRole || null;
      vacancyText = body.vacancyText || null;

      if (!cvDocumentId) {
        return NextResponse.json({ error: 'cvDocumentId talab qilinadi' }, { status: 400 });
      }

      const cvDoc = await prisma.cvDocument.findUnique({
        where: { id: cvDocumentId },
      });

      if (!cvDoc || (cvDoc.userId !== session.userId && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'CV topilmadi yoki ruxsat yo‘q' }, { status: 404 });
      }

      // Build composite text for review
      cvTextToAnalyze = `
        Sarlavha: ${cvDoc.title}
        Xulosa: ${cvDoc.summary || ''}
        Ta'lim: ${cvDoc.educationData || ''}
        Tajriba: ${cvDoc.experienceData || ''}
        Loyihalar: ${cvDoc.projectsData || ''}
        Ko'nikmalar: ${cvDoc.skillsData || ''}
        Tillar: ${cvDoc.languagesData || ''}
      `;
    }

    // Compute content hash to detect future edits
    const contentHash = crypto.createHash('sha256').update(cvTextToAnalyze).digest('hex');

    // Create CV Review record
    const reviewRecord = await prisma.cvReview.create({
      data: {
        userId: session.userId,
        cvDocumentId: cvDocumentId!,
        targetRole,
        vacancyText,
        cvContentHash: contentHash,
        status: 'PROCESSING',
      },
    });

    const adapter = getAiAdapter();
    const isConfigured = isAiConfigured();

    try {
      const reviewResult = await adapter.reviewCv(cvTextToAnalyze, targetRole || undefined, vacancyText || undefined);

      const updatedReview = await prisma.cvReview.update({
        where: { id: reviewRecord.id },
        data: {
          overviewText: reviewResult.overview,
          strengthsJson: JSON.stringify(reviewResult.strengths),
          suggestionsJson: JSON.stringify(reviewResult.suggestions),
          status: 'COMPLETED',
        },
        include: {
          cvDocument: true,
        },
      });

      return NextResponse.json({
        success: true,
        isAiConfigured: isConfigured,
        review: updatedReview,
        notice: isConfigured
          ? undefined
          : 'Haqiqiy GEMINI_API_KEY sozlanmaganligi sababli namunaviy (mock) AI tahlili yaratildi.',
      });
    } catch (procErr: any) {
      console.error('Review generation error:', procErr);
      await prisma.cvReview.update({
        where: { id: reviewRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: procErr.message || 'AI tahlilida xatolik yuz berdi',
        },
      });

      return NextResponse.json(
        { error: 'AI tahlilida xatolik yuz berdi: ' + procErr.message },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/cv-review error:', error);
    return NextResponse.json({ error: 'Tahlil so‘rovida xatolik' }, { status: 500 });
  }
}
