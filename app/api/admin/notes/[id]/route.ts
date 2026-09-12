import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';

const noteUpdateSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  subjectId: z.string().uuid().optional(),
  description: z.string().min(5).optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  fileSize: z.coerce.number().int().nonnegative().optional(),
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

  const note = await db.note.findUnique({
    where: { id: params.id },
    include: { subject: true },
  });

  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  return NextResponse.json({ note });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = noteUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const current = await db.note.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!current) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    const data: any = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.subjectId !== undefined) data.subjectId = parsed.data.subjectId;
    if (parsed.data.description !== undefined) {
      data.description = sanitizeHtml(parsed.data.description);
    }
    if (parsed.data.fileUrl !== undefined) data.fileUrl = parsed.data.fileUrl;
    if (parsed.data.fileType !== undefined) data.fileType = parsed.data.fileType;
    if (parsed.data.fileSize !== undefined) data.fileSize = parsed.data.fileSize;
    if (parsed.data.tags !== undefined) {
      data.tags = parsed.data.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.slug !== undefined && parsed.data.slug !== current.slug) {
      data.slug = slugify(parsed.data.slug);
    }

    const updated = await db.note.update({
      where: { id: params.id },
      data,
      include: { subject: true },
    });

    revalidatePath('/');
    revalidatePath('/notes');
    revalidatePath(`/notes/${current.slug}`);
    revalidatePath(`/notes/${updated.slug}`);
    revalidatePath(`/subject/${current.subject.slug}`);
    revalidatePath(`/subject/${updated.subject.slug}`);

    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error('Admin note update error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const note = await db.note.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

    await db.note.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/notes');
    revalidatePath(`/notes/${note.slug}`);
    revalidatePath(`/subject/${note.subject.slug}`);

    return NextResponse.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Admin note delete error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

