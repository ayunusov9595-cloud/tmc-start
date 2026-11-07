import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTemplateById, TEMPLATE_CONFIGS } from '@/lib/cv-templates';
import { buildCvHtml, CvData } from '@/lib/cv-html-builder';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // 'pdf' or 'html'

    const cv = await prisma.cvDocument.findUnique({
      where: { id: params.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV topilmadi' }, { status: 404 });
    }

    if (cv.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const template = getTemplateById(cv.templateId || '') || TEMPLATE_CONFIGS[0];

    // Parse JSON fields
    const cvData: CvData = {
      title: cv.title,
      personalInfo: cv.personalInfo ? JSON.parse(cv.personalInfo) : {},
      summary: cv.summary || '',
      educationData: cv.educationData ? JSON.parse(cv.educationData) : [],
      experienceData: cv.experienceData ? JSON.parse(cv.experienceData) : [],
      projectsData: cv.projectsData ? JSON.parse(cv.projectsData) : [],
      skillsData: cv.skillsData ? JSON.parse(cv.skillsData) : [],
      languagesData: cv.languagesData ? JSON.parse(cv.languagesData) : [],
      certificatesData: cv.certificatesData ? JSON.parse(cv.certificatesData) : [],
    };

    const html = buildCvHtml(cvData, template);

    // If requested format is html (e.g. for preview or browser direct print)
    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Try server-side Puppeteer PDF rendering
    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '12mm',
          bottom: '12mm',
          left: '12mm',
        },
      });

      await browser.close();

      const safeTitle = (cv.title || 'rezyume')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        },
      });
    } catch (puppeteerErr: any) {
      console.warn('[PDF] Puppeteer export fallback to styled printable HTML:', puppeteerErr.message);

      // Fallback: return printable HTML with automatic print trigger
      const printableHtml = html.replace(
        '</body>',
        '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script></body>',
      );

      return new NextResponse(printableHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-PDF-Fallback': 'browser-print',
        },
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('GET /api/cv/[id]/pdf error:', error);
    return NextResponse.json({ error: 'PDF yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}
