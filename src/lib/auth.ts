import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserSession {
  userId: string;
  email: string;
  role: string;
  name: string;
}

interface JWTUserPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Secret
// ---------------------------------------------------------------------------

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'tmc-start-dev-secret-change-in-production';

function getSecret(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET_STRING);
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

export async function signJWT(payload: UserSession): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  } as JWTUserPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());

  return token;
}

export async function verifyJWT(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as JWTUserPayload;

    if (!p.userId || !p.email || !p.role || !p.name) {
      return null;
    }

    return {
      userId: p.userId,
      email: p.email,
      role: p.role,
      name: p.name,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. Cookie: tmc_session=<token>
  const cookie = request.cookies.get('tmc_session');
  if (cookie?.value) {
    return cookie.value;
  }

  return null;
}

/**
 * Extract the authenticated user from the request, or return null.
 */
export async function getAuthUser(
  request: NextRequest,
): Promise<UserSession | null> {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  return verifyJWT(token);
}

/**
 * Extract the authenticated user from the request. Throws if unauthenticated.
 */
export async function requireAuth(request: NextRequest): Promise<UserSession> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError('Tizimga kirish talab qilinadi', 401);
  }
  return user;
}

/**
 * Require that the authenticated user has one of the given roles.
 */
export async function requireRole(
  request: NextRequest,
  roles: string[],
): Promise<UserSession> {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new AuthError('Ruxsat berilmagan', 403);
  }
  return user;
}

// ---------------------------------------------------------------------------
// Auth error class
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
