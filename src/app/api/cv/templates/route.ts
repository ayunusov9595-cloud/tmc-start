import { NextRequest, NextResponse } from 'next/server';
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_FAMILIES,
  TemplateConfig,
} from '@/lib/cv-templates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const family = searchParams.get('family');
  const search = searchParams.get('search')?.toLowerCase().trim();

  let filtered = [...TEMPLATE_CONFIGS];

  if (family && family !== 'all') {
    filtered = filtered.filter((t) => t.family === family);
  }

  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.variant.toLowerCase().includes(search),
    );
  }

  // Calculate honest metadata
  const totalCount = TEMPLATE_CONFIGS.length; // 108
  const baseLayoutsCount = 6 * 3; // 6 families × 3 distinct structural layouts = 18 base layouts
  const variantsPerLayout = 6; // 6 color & typography style variants per base layout

  const familyStats: Record<string, { label: string; count: number; baseLayouts: number }> = {};
  for (const [key, meta] of Object.entries(TEMPLATE_FAMILIES)) {
    const famTemplates = TEMPLATE_CONFIGS.filter((t) => t.family === key);
    familyStats[key] = {
      label: meta.label,
      count: famTemplates.length,
      baseLayouts: 3,
    };
  }

  return NextResponse.json({
    templates: filtered,
    totalCount,
    baseLayoutsCount,
    variantsPerLayout,
    familyStats,
    families: TEMPLATE_FAMILIES,
  });
}
