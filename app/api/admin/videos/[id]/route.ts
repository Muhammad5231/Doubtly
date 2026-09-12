import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

function extractYouTubeId(input: string): string | null {
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

const videoUpdateSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  subjectId: z.string().uuid().optional(),
  youtubeId: z.string().min(5).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const video = await db.video.findUnique({
    where: { id: params.id },
    include: { subject: true },
  });

  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  return NextResponse.json({ video });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = videoUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const current = await db.video.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!current) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    const data: any = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.subjectId !== undefined) data.subjectId = parsed.data.subjectId;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.youtubeId !== undefined) {
      const cleanId = extractYouTubeId(parsed.data.youtubeId);
      if (!cleanId) {
        return NextResponse.json(
          { error: 'Invalid YouTube Video ID format' },
          { status: 400 }
        );
      }
      data.youtubeId = cleanId;
    }

    const updated = await db.video.update({
      where: { id: params.id },
      data,
      include: { subject: true },
    });

    revalidatePath('/');
    revalidatePath('/videos');
    revalidatePath(`/subject/${current.subject.slug}`);
    revalidatePath(`/subject/${updated.subject.slug}`);

    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.error('Admin video update error:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthenticatedAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const video = await db.video.findUnique({
      where: { id: params.id },
      include: { subject: true },
    });

    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    await db.video.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/videos');
    revalidatePath(`/subject/${video.subject.slug}`);

    return NextResponse.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.error('Admin video delete error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}

