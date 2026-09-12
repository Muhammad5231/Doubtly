import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchContent } from '@/lib/search/rank';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  q: z.string().max(200).default(''),
  subject: z.string().optional(),
  type: z.enum(['all', 'questions', 'notes']).default('all'),
  sort: z.enum(['relevance', 'newest', 'views']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') || '',
      subject: searchParams.get('subject') || undefined,
      type: searchParams.get('type') || 'all',
      sort: searchParams.get('sort') || 'relevance',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { q, subject, type, sort, page, limit } = parsed.data;

    // Log submitted query if non-empty
    if (q.trim().length >= 2) {
      const cleanQuery = q.trim().toLowerCase();
      db.searchLog
        .upsert({
          where: { query: cleanQuery },
          update: {
            count: { increment: 1 },
            lastSearchedAt: new Date(),
          },
          create: {
            query: cleanQuery,
            count: 1,
          },
        })
        .catch((err) => {
          console.error('Failed to log search query:', err);
        });
    }

    const results = await searchContent({
      query: q,
      subjectSlug: subject,
      type,
      sort,
      page,
      limit,
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while searching content' },
      { status: 500 }
    );
  }
}

