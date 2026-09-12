import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or less than 32 characters.'
  );
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
export const ADMIN_COOKIE_NAME = 'doubtly_admin';
export const TOKEN_EXPIRY_SECONDS = 8 * 60 * 60; // 8 hours

export interface AdminJwtPayload {
  adminId: string;
  username: string;
  exp?: number;
}

export async function hashPassword(plainText: string): Promise<string> {
  // Bcrypt cost factor >= 12
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function signAdminToken(payload: { adminId: string; username: string }): Promise<string> {
  return new SignJWT({
    adminId: payload.adminId,
    username: payload.username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function getAdminCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: TOKEN_EXPIRY_SECONDS,
  };
}

export async function getAuthenticatedAdmin(): Promise<AdminJwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

