import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { sanitizeHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';

const questionUpdateSchema = z.object({
  title: z.string().min(5).max(300).optional(),
  subjectId: z.string().uuid().optional(),
  body: z.string().min(10).optional(),
  answer: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  slug: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const question = await db.question.findUnique({
    where: { id: params.id },
    include: { subject: true },
  });

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  return NextResponse.json({ question });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = questionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const current = await db.question.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const data: any = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.subjectId !== undefined) data.subjectId = parsed.data.subjectId;
    if (parsed.data.body !== undefined) data.body = sanitizeHtml(parsed.data.body);
    if (parsed.data.answer !== undefined) data.answer = sanitizeHtml(parsed.data.answer);
    if (parsed.data.tags !== undefined) {
      data.tags = parsed.data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.slug !== undefined && parsed.data.slug !== current.slug) {
      let slugCandidate = slugify(parsed.data.slug);
      let count = 1;
      while (
        await db.question.findFirst({
          where: { slug: slugCandidate, NOT: { id: params.id } },
        })
      ) {
        slugCandidate = `${slugify(parsed.data.slug)}-${count}`;
        count++;
      }
      data.slug = slugCandidate;
    }

    const updated = await db.question.update({
      where: { id: params.id },
      data,
      include: { subject: true },
    });

    // Revalidate paths
    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath(`/subject/${current.subject.slug}`);
    revalidatePath(`/subject/${updated.subject.slug}`);
    revalidatePath(`/q/${current.slug}`);
    revalidatePath(`/q/${updated.slug}`);

    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error('Admin question update error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const question = await db.question.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    await db.question.delete({
      where: { id: params.id },
    });

    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath(`/subject/${question.subject.slug}`);
    revalidatePath(`/q/${question.slug}`);

    return NextResponse.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Admin question delete error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}

