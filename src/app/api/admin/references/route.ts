import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN']);

    const [roles, orgTypes] = await Promise.all([
      prisma.roleReference.findMany({ orderBy: { title: 'asc' } }),
      prisma.organizationType.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({ roles, orgTypes });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Ma‘lumotnomalarni olishda xatolik' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN']);
    const body = await request.json();
    const { type, title, category, description, name } = body;

    if (type === 'ROLE') {
      const created = await prisma.roleReference.create({
        data: {
          title,
          category: category || 'IT',
          description,
        },
      });
      return NextResponse.json({ success: true, item: created }, { status: 201 });
    } else {
      const created = await prisma.organizationType.create({
        data: {
          name,
          description,
        },
      });
      return NextResponse.json({ success: true, item: created }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Qo‘shishda xatolik yuz berdi' }, { status: 500 });
  }
}
