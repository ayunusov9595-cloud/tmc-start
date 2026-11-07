import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
] as const;

/** 10 MB */
export const MAX_CV_SIZE = 10 * 1024 * 1024;

/** 25 MB */
export const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Upload root
// ---------------------------------------------------------------------------

const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extensionFromName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return ext || '';
}

function generateFileName(originalName: string): string {
  const hex = randomBytes(16).toString('hex');
  const ext = extensionFromName(originalName);
  return `${hex}${ext}`;
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Save a buffer to disk under `uploads/{category}/`.
 * Returns a *fileKey* such as `"cv/abc123def456.pdf"` that can be stored in
 * the database and later resolved with `getFilePath`.
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string,
  category: string,
): Promise<string> {
  const fileName = generateFileName(originalName);
  const categoryDir = path.join(UPLOAD_ROOT, category);

  await fs.mkdir(categoryDir, { recursive: true });

  const filePath = path.join(categoryDir, fileName);
  await fs.writeFile(filePath, buffer);

  // Return a portable key: "category/filename"
  const fileKey = `${category}/${fileName}`;
  return fileKey;
}

/**
 * Resolve a fileKey to an absolute path on disk.
 */
export function getFilePath(fileKey: string): string {
  // Prevent path traversal
  const normalized = path.normalize(fileKey);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new Error('Invalid file key');
  }

  return path.join(UPLOAD_ROOT, normalized);
}

/**
 * Delete a file from disk by its fileKey.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const filePath = getFilePath(fileKey);

  try {
    await fs.unlink(filePath);
  } catch (err: unknown) {
    // If the file is already gone we consider it a success
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an uploaded file against allowed MIME types and max size.
 */
export function validateFile(
  file: { type: string; size: number },
  allowedTypes: readonly string[],
  maxSize: number,
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Fayl turi qabul qilinmaydi. Ruxsat etilgan turlar: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Fayl hajmi ${maxMB} MB dan oshmasligi kerak`,
    };
  }

  return { valid: true };
}
