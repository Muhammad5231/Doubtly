import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

function extractYouTubeId(input: string): string | null {
  const clean = input.trim();
  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  // Match youtube.com/watch?v=ID or youtu.be/ID
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

const videoCreateSchema = z.object({
  title: z.string().min(3, 'Title is required').max(300),
  subjectId: z.string().uuid('Valid subject ID is required'),
  youtubeId: z.string().min(5, 'YouTube link or 11-character video ID is required'),
  description: z.string().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
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
    whereClause.title = { contains: search, mode: 'insensitive' };
  }

  const [videos, total] = await Promise.all([
    db.video.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.video.count({ where: whereClause }),
  ]);

  return NextResponse.json({
    videos,
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
    const parsed = videoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid video data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, subjectId, youtubeId: rawInput, description, status } = parsed.data;

    const cleanYoutubeId = extractYouTubeId(rawInput);
    if (!cleanYoutubeId) {
      return NextResponse.json(
        { error: 'Invalid YouTube Video ID. Must be a valid 11-character ID or YouTube watch URL.' },
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        title,
        subjectId,
        youtubeId: cleanYoutubeId,
        description,
        status,
      },
      include: { subject: true },
    });

    revalidatePath('/');
    revalidatePath('/videos');
    revalidatePath(`/subject/${video.subject.slug}`);

    return NextResponse.json({ success: true, video }, { status: 201 });
  } catch (error) {
    console.error('Admin create video error:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}

