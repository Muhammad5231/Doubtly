import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';

const noteCreateSchema = z.object({
  title: z.string().min(3, 'Title is required').max(300),
  subjectId: z.string().uuid('Valid subject ID is required'),
  description: z.string().min(5, 'Description is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  fileType: z.string().default('pdf'),
  fileSize: z.coerce.number().int().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  slug: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
  const search = searchParams.get('search') || '';

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [notes, total] = await Promise.all([
    db.note.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.note.count({ where: whereClause }),
  ]);

  return NextResponse.json({
    notes,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = noteCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid note data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, subjectId, description, fileUrl, fileType, fileSize, tags, status } =
      parsed.data;

    let baseSlug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await db.note.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    const note = await db.note.create({
      data: {
        title,
        slug: finalSlug,
        subjectId,
        description: sanitizeHtml(description),
        fileUrl,
        fileType,
        fileSize,
        tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
        status,
      },
      include: { subject: true },
    });

    revalidatePath('/');
    revalidatePath('/notes');
    revalidatePath(`/notes/${note.slug}`);
    revalidatePath(`/subject/${note.subject.slug}`);

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error('Admin create note error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

