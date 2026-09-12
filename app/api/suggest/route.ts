import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeQuery } from '@/lib/search/normalize';
import { suggestCache } from '@/lib/cache/lru';

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
    const cacheKey = `suggest:${rawCleaned.toLowerCase()}`;

    // Fast-path: Check in-memory LRU cache (<2ms)
    const cached = suggestCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const searchPattern = `%${rawCleaned}%`;

    // Execute parallel pruned queries with explicit field selection
    const [questions, subjects, searchLogs, tagResults] = await Promise.all([
      // 1. Up to 6 questions with teaser preview snippet
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
          tags: true,
          body: true,
          createdAt: true,
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

    // Format questions with preview teaser for Raycast-style split pane
    const formattedQuestions = questions.map((q) => {
      const cleanSnippet = q.body
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);

      return {
        id: q.id,
        title: q.title,
        slug: q.slug,
        views: q.views,
        tags: q.tags.slice(0, 3),
        snippet: cleanSnippet ? `${cleanSnippet}...` : 'Step-by-step academic verified solution available.',
        subject: q.subject,
        createdAt: q.createdAt.toISOString(),
      };
    });

    const responsePayload = {
      questions: formattedQuestions,
      tags,
      subjects,
      recentQueries: searchLogs.map((s) => s.query),
    };

    // Store in LRU cache for 5 minutes
    suggestCache.set(cacheKey, responsePayload, 5 * 60 * 1000);

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Suggest API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

