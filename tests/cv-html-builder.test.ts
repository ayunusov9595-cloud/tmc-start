import { describe, it, expect } from 'vitest';
import { buildCvHtml } from '@/lib/cv-html-builder';
import { TEMPLATE_CONFIGS } from '@/lib/cv-templates';

describe('CV HTML Builder', () => {
  it('should correctly render Uzbek characters and structured sections', () => {
    const sampleCv = {
      title: 'Dasturchi rezyumesi',
      personalInfo: {
        fullName: 'Jasur G‘iyosovich O‘ktamov',
        email: 'jasur@tmc.uz',
        phone: '+998 90 123 45 67',
        city: 'Toshkent shahri',
      },
      summary: 'Axborot texnologiyalari bo‘yicha o‘quvchi va amaliyotchi.',
      educationData: [
        {
          institution: 'TMC Institute',
          degree: 'Bakalavr',
          fieldOfStudy: 'Dasturiy injiniring',
          startYear: 2022,
          endYear: 2026,
        },
      ],
      skillsData: [
        { name: 'TypeScript', proficiency: 'ADVANCED' },
        { name: 'React', proficiency: 'EXPERT' },
      ],
      languagesData: [
        { language: 'O‘zbek tili', proficiency: 'Ona tili' },
      ],
    };

    const template = TEMPLATE_CONFIGS[0];
    const html = buildCvHtml(sampleCv, template);

    // Verify Uzbek special characters are preserved without corruption
    expect(html).toContain('Jasur G‘iyosovich O‘ktamov');
    expect(html).toContain('bo‘yicha o‘quvchi');
    expect(html).toContain('O‘zbek tili');
    expect(html).toContain('TMC Institute');
    expect(html).toContain('TypeScript');

    // Verify HTML layout integrity
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="uz">');
    expect(html).toContain(template.colors.primary);
  });

  it('should omit empty optional sections without leaving broken placeholders', () => {
    const beginnerCv = {
      title: 'Yangi talaba rezyumesi',
      personalInfo: {
        fullName: 'Alisher Vohidov',
        email: 'alisher@tmc.uz',
      },
      educationData: [
        {
          institution: 'TMC Institute',
          degree: 'Bakalavr',
          fieldOfStudy: 'Biznes boshqaruvi',
          startYear: 2023,
        },
      ],
      // No experience, no certificates, no projects
    };

    const html = buildCvHtml(beginnerCv);

    expect(html).toContain('Alisher Vohidov');
    expect(html).toContain('Biznes boshqaruvi');
    // Ensure empty sections are not rendered
    expect(html).not.toContain('Ish va Amaliyot Tajribasi');
    expect(html).not.toContain('Sertifikatlar va Yutuqlar');
  });
});
