import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';

const questionCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(300),
  subjectId: z.string().uuid('Valid subject ID is required'),
  body: z.string().min(10, 'Question body is required'),
  answer: z.string().min(10, 'Answer content is required'),
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
  const status = searchParams.get('status') || '';
  const subjectId = searchParams.get('subjectId') || '';

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status === 'DRAFT' || status === 'PUBLISHED') {
    whereClause.status = status;
  }
  if (subjectId) {
    whereClause.subjectId = subjectId;
  }

  const [questions, total] = await Promise.all([
    db.question.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, slug: true } },
        _count: { select: { helpfulVotes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.question.count({ where: whereClause }),
  ]);

  return NextResponse.json({
    questions,
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
    const parsed = questionCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid question data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, subjectId, body: rawBody, answer: rawAnswer, tags, status } = parsed.data;

    // Sanitize rich text inputs before storing
    const cleanBody = sanitizeHtml(rawBody);
    const cleanAnswer = sanitizeHtml(rawAnswer);

    // Generate unique slug
    let baseSlug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await db.question.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    const question = await db.question.create({
      data: {
        title,
        slug: finalSlug,
        subjectId,
        body: cleanBody,
        answer: cleanAnswer,
        tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
        status,
      },
      include: {
        subject: true,
      },
    });

    // Revalidate public pages instantly
    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/trending');
    revalidatePath(`/subject/${question.subject.slug}`);
    revalidatePath(`/q/${question.slug}`);

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error: any) {
    console.error('Admin create question error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

