import { describe, it, expect } from 'vitest';
import { getAiAdapter, isAiConfigured } from '@/lib/ai-adapter';

describe('AI Adapter System', () => {
  it('should fall back to grounded MockAdapter when GEMINI_API_KEY is not set', () => {
    // In dev / test environment without GEMINI_API_KEY
    expect(isAiConfigured()).toBe(false);
    const adapter = getAiAdapter();
    expect(adapter).toBeDefined();
  });

  it('should produce structured CV review with overview, strengths, and actionable suggestions', async () => {
    const adapter = getAiAdapter();
    const result = await adapter.reviewCv('Talaba rezyumesi matni: React, JavaScript, TMC Institute.');

    expect(result).toBeDefined();
    expect(typeof result.overview).toBe('string');
    expect(result.overview.length).toBeGreaterThan(10);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);

    const firstSuggestion = result.suggestions[0];
    expect(firstSuggestion.section).toBeDefined();
    expect(firstSuggestion.issue).toBeDefined();
    expect(firstSuggestion.suggestion).toBeDefined();
    expect(firstSuggestion.status).toBe('pending');
  });

  it('should generate career recommendations with roles, org types, and readiness levels', async () => {
    const adapter = getAiAdapter();
    const recommendations = await adapter.extractCareerGuidance(
      'Dasturiy injiniring 3-kurs talabasi, React va Python biladi.',
    );

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);

    const first = recommendations[0];
    expect(first.role).toBeDefined();
    expect(Array.isArray(first.organizationTypes)).toBe(true);
    expect(first.whySuitable).toBeDefined();
    expect(Array.isArray(first.strengths)).toBe(true);
    expect(first.preparationStep).toBeDefined();
    expect(['ready_now', 'needs_preparation']).toContain(first.readinessLevel);
  });

  it('should extract structured profile fields from natural language text', async () => {
    const adapter = getAiAdapter();
    const fields = await adapter.extractProfileFromText(
      'Mening ismim Jasur. TMC da 3-kursda o‘qiyman. React va Python bilaman.',
    );

    expect(fields).toBeDefined();
    expect(fields.skills).toBeDefined();
    expect(fields.education).toBeDefined();
  });

  it('should transcribe audio buffer to Uzbek text', async () => {
    const adapter = getAiAdapter();
    const mockBuffer = Buffer.from('fake-audio-bytes');
    const transcript = await adapter.transcribeAudio(mockBuffer, 'audio/webm');

    expect(typeof transcript).toBe('string');
    expect(transcript.length).toBeGreaterThan(10);
  });
});
