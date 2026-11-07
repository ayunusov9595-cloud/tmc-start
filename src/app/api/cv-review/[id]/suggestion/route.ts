import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// POST /api/cv-review/[id]/suggestion – Accept or reject an actionable suggestion
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const { suggestionIndex, action, applyToCv } = body; // action: 'accept' | 'reject'

    const review = await prisma.cvReview.findUnique({
      where: { id: params.id },
      include: { cvDocument: true },
    });

    if (!review) {
      return NextResponse.json({ error: 'Tahlil topilmadi' }, { status: 404 });
    }

    if (review.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const suggestions = review.suggestionsJson ? JSON.parse(review.suggestionsJson) : [];
    if (suggestionIndex === undefined || !suggestions[suggestionIndex]) {
      return NextResponse.json({ error: 'Taklif indeksi noto‘g‘ri' }, { status: 400 });
    }

    const targetSuggestion = suggestions[suggestionIndex];
    targetSuggestion.status = action === 'accept' ? 'accepted' : 'rejected';

    // If accepted and applyToCv requested, update summary or relevant passage in CV
    if (action === 'accept' && applyToCv && targetSuggestion.section?.toLowerCase().includes('xulosa')) {
      await prisma.cvDocument.update({
        where: { id: review.cvDocumentId },
        data: {
          summary: targetSuggestion.suggestion,
        },
      });
    }

    const updatedReview = await prisma.cvReview.update({
      where: { id: params.id },
      data: {
        suggestionsJson: JSON.stringify(suggestions),
      },
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      suggestion: targetSuggestion,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Taklif holatini yangilashda xatolik' }, { status: 500 });
  }
}
