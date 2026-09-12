import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const videosQuerySchema = z.object({
  subject: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = videosQuerySchema.safeParse({
      subject: searchParams.get('subject') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { subject, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const whereClause: any = { status: 'PUBLISHED' };
    if (subject) {
      whereClause.subject = { slug: subject };
    }

    const [videos, total] = await Promise.all([
      db.video.findMany({
        where: whereClause,
        include: {
          subject: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.video.count({ where: whereClause }),
    ]);

    const formatted = videos.map((v) => ({
      id: v.id,
      title: v.title,
      youtubeId: v.youtubeId,
      description: v.description,
      subject: v.subject,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      videos: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Videos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

