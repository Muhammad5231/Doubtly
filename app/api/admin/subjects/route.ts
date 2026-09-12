import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const subjectCreateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  slug: z.string().optional(),
  icon: z.string().default('BookOpen'),
  order: z.coerce.number().int().default(0),
});

export async function GET() {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subjects = await db.subject.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { questions: true, notes: true, videos: true },
      },
    },
  });

  return NextResponse.json({ subjects });
}

export async function POST(request: NextRequest) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = subjectCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subject data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, icon, order } = parsed.data;
    let baseSlug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(name);
    let finalSlug = baseSlug;
    let count = 1;
    while (await db.subject.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    const subject = await db.subject.create({
      data: {
        name,
        slug: finalSlug,
        icon,
        order,
      },
    });

    revalidatePath('/');
    revalidatePath('/subjects');
    revalidatePath(`/subject/${subject.slug}`);

    return NextResponse.json({ success: true, subject }, { status: 201 });
  } catch (error) {
    console.error('Admin create subject error:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

