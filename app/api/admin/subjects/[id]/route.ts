import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

const subjectUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().optional(),
  icon: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subject = await db.subject.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { questions: true, notes: true, videos: true },
      },
    },
  });

  if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  return NextResponse.json({ subject });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = subjectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const current = await db.subject.findUnique({
      where: { id: params.id },
    });

    if (!current) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    const data: any = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.icon !== undefined) data.icon = parsed.data.icon;
    if (parsed.data.order !== undefined) data.order = parsed.data.order;
    if (parsed.data.slug !== undefined && parsed.data.slug !== current.slug) {
      data.slug = slugify(parsed.data.slug);
    }

    const updated = await db.subject.update({
      where: { id: params.id },
      data,
    });

    revalidatePath('/');
    revalidatePath('/subjects');
    revalidatePath(`/subject/${current.slug}`);
    revalidatePath(`/subject/${updated.slug}`);

    return NextResponse.json({ success: true, subject: updated });
  } catch (error) {
    console.error('Admin subject update error:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const subject = await db.subject.findUnique({
      where: { id: params.id },
    });

    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    await db.subject.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/subjects');
    revalidatePath(`/subject/${subject.slug}`);

    return NextResponse.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    console.error('Admin subject delete error:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}

