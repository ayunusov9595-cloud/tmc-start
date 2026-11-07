import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_FAMILIES,
  getTemplateById,
  getTemplatesByFamily,
} from '@/lib/cv-templates';

describe('CV Templates System', () => {
  it('should provide at least 100 usable, unique templates', () => {
    expect(TEMPLATE_CONFIGS.length).toBeGreaterThanOrEqual(100);
    expect(TEMPLATE_CONFIGS.length).toBe(108);

    // Check all IDs are distinct
    const ids = new Set(TEMPLATE_CONFIGS.map((t) => t.id));
    expect(ids.size).toBe(TEMPLATE_CONFIGS.length);
  });

  it('should organize templates across 6 distinct families', () => {
    const expectedFamilies = [
      'minimal',
      'academic',
      'corporate',
      'creative',
      'internship',
      'graduate',
    ];

    expect(Object.keys(TEMPLATE_FAMILIES)).toEqual(expectedFamilies);

    for (const fam of expectedFamilies) {
      const familyTemplates = getTemplatesByFamily(fam as any);
      expect(familyTemplates.length).toBe(18); // 3 layouts × 6 styles
      familyTemplates.forEach((t) => {
        expect(t.family).toBe(fam);
        expect(t.colors.primary).toBeDefined();
        expect(t.layout.columns === 1 || t.layout.columns === 2).toBe(true);
      });
    }
  });

  it('should find template by ID accurately', () => {
    const first = TEMPLATE_CONFIGS[0];
    const found = getTemplateById(first.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe(first.name);
    expect(found?.colors.primary).toBe(first.colors.primary);

    const nonExistent = getTemplateById('non-existent-template');
    expect(nonExistent).toBeUndefined();
  });
});
