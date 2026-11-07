import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { saveFile, deleteFile, ALLOWED_AUDIO_TYPES, MAX_AUDIO_SIZE } from '@/lib/storage';
import { getAiAdapter, isAiConfigured } from '@/lib/ai-adapter';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// POST /api/voice – Upload or submit audio for transcription & field extraction
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio fayl taqdim etilmadi' },
        { status: 400 },
      );
    }

    // Validation
    if (audioFile.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: `Audio hajmi 25MB dan oshmasligi kerak (joriy hajm: ${(audioFile.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 400 },
      );
    }

    const mimeType = audioFile.type || 'audio/webm';
    const isAllowed = ALLOWED_AUDIO_TYPES.some((t) => mimeType.includes(t.split('/')[1]));
    if (!isAllowed && !mimeType.startsWith('audio/')) {
      return NextResponse.json(
        { error: `Qo‘llab-quvvatlanmaydigan audio formati (${mimeType}). WebM, WAV, MP3, OGG formatlaridan foydalaning.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: 'Audio fayl bo‘sh' },
        { status: 400 },
      );
    }

    // Save audio file temporarily
    const fileKey = await saveFile(buffer, audioFile.name || 'recording.webm', 'audio');

    // Create DB record
    const voiceJob = await prisma.voiceJob.create({
      data: {
        userId: session.userId,
        audioFileKey: fileKey,
        audioFileSize: buffer.length,
        audioFormat: mimeType,
        status: 'PROCESSING',
      },
    });

    const adapter = getAiAdapter();
    const isConfigured = isAiConfigured();

    let transcript = '';
    let extractedFields = null;

    try {
      // Step 1: Transcribe
      transcript = await adapter.transcribeAudio(buffer, mimeType);

      // Step 2: Extract structured profile fields from transcript
      if (transcript && transcript.trim().length > 0) {
        extractedFields = await adapter.extractProfileFromText(transcript);
      }

      await prisma.voiceJob.update({
        where: { id: voiceJob.id },
        data: {
          transcript,
          extractedFields: extractedFields ? JSON.stringify(extractedFields) : null,
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        success: true,
        isAiConfigured: isConfigured,
        voiceJobId: voiceJob.id,
        transcript,
        extractedFields,
        notice: isConfigured
          ? undefined
          : 'Haqiqiy GEMINI_API_KEY sozlanmaganligi sababli namunaviy (mock) matn va maydonlar yaratildi.',
      });
    } catch (procErr: any) {
      console.error('Audio processing error:', procErr);
      await prisma.voiceJob.update({
        where: { id: voiceJob.id },
        data: {
          status: 'FAILED',
          errorMessage: procErr.message || 'Ovozni qayta ishlashda xatolik yuz berdi',
        },
      });

      return NextResponse.json(
        {
          error: 'Audio qayta ishlashda xatolik: ' + (procErr.message || 'Xizmat javob bermadi'),
          isAiConfigured: isConfigured,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/voice error:', error);
    return NextResponse.json(
      { error: 'Ovozni yuklashda server xatoligi yuz berdi' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/voice – Purge voice job & raw audio file for privacy compliance
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID talab qilinadi' }, { status: 400 });
    }

    const job = await prisma.voiceJob.findUnique({
      where: { id },
    });

    if (!job || job.userId !== session.userId) {
      return NextResponse.json({ error: 'Topilmadi yoki ruxsat yo‘q' }, { status: 404 });
    }

    // Delete raw audio file
    if (job.audioFileKey) {
      await deleteFile(job.audioFileKey);
    }

    await prisma.voiceJob.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Audio yozuv va ma‘lumotlar to‘liq o‘chirildi' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'O‘chirishda xatolik yuz berdi' }, { status: 500 });
  }
}
