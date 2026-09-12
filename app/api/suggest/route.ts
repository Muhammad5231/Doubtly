import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeQuery } from '@/lib/search/normalize';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQ = searchParams.get('q') || '';

    if (rawQ.trim().length < 2) {
      return NextResponse.json({
        questions: [],
        tags: [],
        subjects: [],
        recentQueries: [],
      });
    }

    const { rawCleaned } = normalizeQuery(rawQ);
    const searchPattern = `%${rawCleaned}%`;

    // Execute parallel searches for suggestions
    const [questions, subjects, searchLogs, tagResults] = await Promise.all([
      // 1. Up to 6 question titles (ILIKE or trigram similarity)
      db.question.findMany({
        where: {
          status: 'PUBLISHED',
          title: { contains: rawCleaned, mode: 'insensitive' },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          subject: { select: { name: true, slug: true } },
        },
        take: 6,
        orderBy: { views: 'desc' },
      }),

      // 2. Up to 3 matching subjects
      db.subject.findMany({
        where: {
          name: { contains: rawCleaned, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
        take: 3,
        orderBy: { order: 'asc' },
      }),

      // 3. Up to 3 recent queries from SearchLog
      db.searchLog.findMany({
        where: {
          query: { contains: rawCleaned, mode: 'insensitive' },
        },
        select: {
          query: true,
          count: true,
        },
        take: 3,
        orderBy: { count: 'desc' },
      }),

      // 4. Up to 4 matching tags
      db.$queryRawUnsafe<Array<{ tag: string }>>(`
        SELECT DISTINCT unnest(tags) as tag
        FROM questions
        WHERE status = 'PUBLISHED'
          AND array_to_string(tags, ' ') ILIKE $1
        LIMIT 4
      `, searchPattern).catch(() => []),
    ]);

    const tags = Array.isArray(tagResults) ? tagResults.map((t) => t.tag).filter(Boolean) : [];

    return NextResponse.json({
      questions,
      tags,
      subjects,
      recentQueries: searchLogs.map((s) => s.query),
    });
  } catch (error: any) {
    console.error('Suggest API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

