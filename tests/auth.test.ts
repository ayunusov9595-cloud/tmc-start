import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signJWT, verifyJWT } from '@/lib/auth';

describe('Auth Utilities', () => {
  it('should hash and verify passwords correctly', async () => {
    const rawPassword = 'SecureStudentPassword2026!';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).not.toBe(rawPassword);
    expect(hashed.startsWith('$2')).toBe(true);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrong = await comparePassword('WrongPassword', hashed);
    expect(isWrong).toBe(false);
  });

  it('should sign and verify valid JWT tokens', async () => {
    const payload = {
      userId: 'test-user-123',
      email: 'student@tmc.uz',
      role: 'STUDENT',
      name: 'Jasur Bekmurodov',
    };

    const token = await signJWT(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const verified = await verifyJWT(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
    expect(verified?.name).toBe(payload.name);
  });

  it('should return null for tampered JWT tokens', async () => {
    const payload = {
      userId: 'test-user-123',
      email: 'student@tmc.uz',
      role: 'STUDENT',
      name: 'Jasur Bekmurodov',
    };

    const token = await signJWT(payload);
    const tampered = token.slice(0, -5) + 'abcde';

    const verified = await verifyJWT(tampered);
    expect(verified).toBeNull();
  });
});
