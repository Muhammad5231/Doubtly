import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAuthenticatedAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await db.admin.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      username: true,
      createdAt: true,
      lastLoginAt: true,
      // Never select or expose passwordHash!
    },
  });

  if (!admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  return NextResponse.json({ admin });
}

