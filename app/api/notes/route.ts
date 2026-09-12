import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const notesQuerySchema = z.object({
  subject: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = notesQuerySchema.safeParse({
      subject: searchParams.get('subject') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
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

    const [notes, total] = await Promise.all([
      db.note.findMany({
        where: whereClause,
        include: {
          subject: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.note.count({ where: whereClause }),
    ]);

    const formatted = notes.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      description: n.description,
      fileUrl: n.fileUrl,
      fileType: n.fileType,
      fileSize: n.fileSize,
      tags: n.tags,
      subject: n.subject,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      notes: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Notes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

