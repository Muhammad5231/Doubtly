import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  verifyPassword,
  signAdminToken,
  getAdminCookieOptions,
  ADMIN_COOKIE_NAME,
} from '@/lib/auth';
import { rateLimit, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required'),
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers);

  // 1. Rate-limit login attempts: 5 attempts per 15 min per IP
  const rateCheck = rateLimit(`login_${clientIp}`, LOGIN_RATE_LIMIT);
  if (!rateCheck.success) {
    await delay(300);
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      await delay(300);
      return NextResponse.json(
        { error: 'Invalid login payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // 2. Find admin in database
    const admin = await db.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      // Intentional 300ms delay on failure to thwart timing attacks
      await delay(300);
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // 3. Compare password with bcrypt
    const passwordMatch = await verifyPassword(password, admin.passwordHash);
    if (!passwordMatch) {
      await delay(300);
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // 4. Update lastLoginAt
    await db.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Sign JWT token (jose, HS256, 8h expiry)
    const token = await signAdminToken({
      adminId: admin.id,
      username: admin.username,
    });

    // 6. Set httpOnly, Secure, SameSite=Strict cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
      },
    });

    const cookieOptions = getAdminCookieOptions();
    response.cookies.set({
      ...cookieOptions,
      value: token,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    await delay(300);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}

