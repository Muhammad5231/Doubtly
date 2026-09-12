import { db } from '@/lib/db';
import { normalizeQuery } from './normalize';
import { sanitizeHtml } from '@/lib/sanitize';

export interface SearchResultItem {
  id: string;
  type: 'question' | 'note';
  title: string;
  slug: string;
  snippet: string;
  subjectName: string;
  subjectSlug: string;
  views: number;
  tags: string[];
  score: number;
  createdAt: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

/**
 * Highlights matched query terms in text using safe <mark> tags.
 */
export function highlightMatches(text: string, queryWords: string[], maxLen = 220): string {
  if (!text) return '';
  // Plain text strip
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!queryWords || queryWords.length === 0) {
    return plain.slice(0, maxLen) + (plain.length > maxLen ? '...' : '');
  }

  // Find position of the first matching word to center the snippet
  const lowerPlain = plain.toLowerCase();
  let firstIdx = -1;
  for (const word of queryWords) {
    if (word.length >= 2) {
      const idx = lowerPlain.indexOf(word.toLowerCase());
      if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
        firstIdx = idx;
      }
    }
  }

  let start = Math.max(0, firstIdx - 40);
  let end = Math.min(plain.length, start + maxLen);
  if (start > 0) {
    // Snap to nearest previous space
    const spaceIdx = plain.indexOf(' ', start);
    if (spaceIdx !== -1 && spaceIdx < start + 20) {
      start = spaceIdx + 1;
    }
  }

  let snippet = plain.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < plain.length) snippet = snippet + '...';

  // Highlight matches
  for (const word of queryWords) {
    if (word.length >= 2) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      snippet = snippet.replace(regex, '<mark class="bg-spark/30 text-ink dark:text-white font-medium rounded px-0.5">$1</mark>');
    }
  }

  return sanitizeHtml(snippet);
}

export interface SearchOptions {
  query: string;
  subjectSlug?: string;
  type?: 'all' | 'questions' | 'notes';
  sort?: 'relevance' | 'newest' | 'views' | 'helpful';
  hasMath?: boolean;
  verifiedOnly?: boolean;
  difficulty?: string;
  page?: number;
  limit?: number;
}

export async function searchContent(options: SearchOptions): Promise<{
  items: SearchResultItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { query, subjectSlug, type = 'all', sort = 'relevance', page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  const { normalized, rawCleaned } = normalizeQuery(query);
  const queryTokens = rawCleaned.split(' ').filter((w) => w.length >= 2);

  // If query is empty, return latest published items
  if (!normalized) {
    return fetchBrowseContent({ subjectSlug, type, sort, page, limit, offset });
  }

  // Construct parameterized SQL for blended ranking
  // Score formula:
  // ts_rank_cd(search_vector, websearch_to_tsquery('english', $q), 32) * 1.0
  // + similarity(title, $raw) * 0.35
  // + LN(1 + views) * 0.02
  const subjectCondition = subjectSlug ? `AND s.slug = $3` : '';

  let orderByClause = `ORDER BY score DESC, created_at DESC`;
  if (sort === 'newest') {
    orderByClause = `ORDER BY created_at DESC`;
  } else if (sort === 'views' || sort === 'helpful') {
    orderByClause = `ORDER BY views DESC, score DESC`;
  }

  // Prepare queries for questions and notes
  const includeQuestions = type === 'all' || type === 'questions';
  const includeNotes = type === 'all' || type === 'notes';

  const parts: string[] = [];

  if (includeQuestions) {
    parts.push(`
      SELECT 
        q.id::text as id,
        'question' as type,
        q.title,
        q.slug,
        q.body as raw_content,
        s.name as subject_name,
        s.slug as subject_slug,
        q.views,
        q.tags,
        q."createdAt" as created_at,
        NULL as file_url,
        NULL as file_type,
        0 as file_size,
        (
          ts_rank_cd(q."searchVector", websearch_to_tsquery('english', $1), 32) * 1.0
          + similarity(q.title, $2) * 0.35
          + LN(1 + q.views) * 0.02
        ) as score
      FROM "questions" q
      JOIN "subjects" s ON q."subjectId" = s.id
      WHERE q.status = 'PUBLISHED'
        AND (q."searchVector" @@ websearch_to_tsquery('english', $1) OR q.title % $2)
        ${subjectCondition}
    `);
  }

  if (includeNotes) {
    parts.push(`
      SELECT 
        n.id::text as id,
        'note' as type,
        n.title,
        n.slug,
        n.description as raw_content,
        s.name as subject_name,
        s.slug as subject_slug,
        0 as views,
        n.tags,
        n."createdAt" as created_at,
        n."fileUrl" as file_url,
        n."fileType" as file_type,
        n."fileSize" as file_size,
        (
          ts_rank_cd(n."searchVector", websearch_to_tsquery('english', $1), 32) * 1.0
          + similarity(n.title, $2) * 0.35
        ) as score
      FROM "notes" n
      JOIN "subjects" s ON n."subjectId" = s.id
      WHERE n.status = 'PUBLISHED'
        AND (n."searchVector" @@ websearch_to_tsquery('english', $1) OR n.title % $2)
        ${subjectCondition}
    `);
  }

  const unionSql = parts.join(' UNION ALL ');
  const sql = `
    WITH search_results AS (
      ${unionSql}
    )
    SELECT *, count(*) OVER() AS full_count
    FROM search_results
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset};
  `;

  try {
    const params = subjectSlug ? [normalized, rawCleaned, subjectSlug] : [normalized, rawCleaned];
    const rows = (await db.$queryRawUnsafe(sql, ...params)) as any[];

    const total = rows.length > 0 ? Number(rows[0].full_count) : 0;
    const items: SearchResultItem[] = rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      slug: r.slug,
      snippet: highlightMatches(r.raw_content, queryTokens),
      subjectName: r.subject_name,
      subjectSlug: r.subject_slug,
      views: Number(r.views || 0),
      tags: r.tags || [],
      score: Number(r.score || 0),
      createdAt: new Date(r.created_at).toISOString(),
      fileUrl: r.file_url || undefined,
      fileType: r.file_type || undefined,
      fileSize: r.file_size || undefined,
    }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Search SQL error, falling back to Prisma standard query:', error);
    return fallbackSearch({ query: rawCleaned, subjectSlug, type, page, limit, offset });
  }
}

/**
 * Fallback search using standard ILIKE when tsvector/trgm extensions aren't ready
 */
async function fallbackSearch({
  query,
  subjectSlug,
  type,
  page,
  limit,
  offset,
}: {
  query: string;
  subjectSlug?: string;
  type: string;
  page: number;
  limit: number;
  offset: number;
}) {
  const subjectFilter = subjectSlug ? { subject: { slug: subjectSlug } } : {};
  const queryTokens = query.split(' ').filter(Boolean);

  let questionItems: SearchResultItem[] = [];
  let noteItems: SearchResultItem[] = [];

  if (type === 'all' || type === 'questions') {
    const questions = await db.question.findMany({
      where: {
        status: 'PUBLISHED',
        ...subjectFilter,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { body: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { subject: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    questionItems = questions.map((q) => ({
      id: q.id,
      type: 'question',
      title: q.title,
      slug: q.slug,
      snippet: highlightMatches(q.body, queryTokens),
      subjectName: q.subject.name,
      subjectSlug: q.subject.slug,
      views: q.views,
      tags: q.tags,
      score: 1.0,
      createdAt: q.createdAt.toISOString(),
    }));
  }

  if (type === 'all' || type === 'notes') {
    const notes = await db.note.findMany({
      where: {
        status: 'PUBLISHED',
        ...subjectFilter,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { subject: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    noteItems = notes.map((n) => ({
      id: n.id,
      type: 'note',
      title: n.title,
      slug: n.slug,
      snippet: highlightMatches(n.description, queryTokens),
      subjectName: n.subject.name,
      subjectSlug: n.subject.slug,
      views: 0,
      tags: n.tags,
      score: 1.0,
      createdAt: n.createdAt.toISOString(),
      fileUrl: n.fileUrl,
      fileType: n.fileType,
      fileSize: n.fileSize,
    }));
  }

  const items = [...questionItems, ...noteItems].slice(0, limit);
  const total = items.length;

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Fetch default browse items when search query is empty
 */
async function fetchBrowseContent({
  subjectSlug,
  type,
  sort,
  page,
  limit,
  offset,
}: {
  subjectSlug?: string;
  type: string;
  sort: string;
  page: number;
  limit: number;
  offset: number;
}) {
  const subjectFilter = subjectSlug ? { subject: { slug: subjectSlug } } : {};
  const orderBy: any = sort === 'views' ? { views: 'desc' } : { createdAt: 'desc' };

  let items: SearchResultItem[] = [];
  let total = 0;

  if (type === 'all' || type === 'questions') {
    const [questions, count] = await Promise.all([
      db.question.findMany({
        where: { status: 'PUBLISHED', ...subjectFilter },
        include: { subject: true },
        take: limit,
        skip: offset,
        orderBy,
      }),
      db.question.count({ where: { status: 'PUBLISHED', ...subjectFilter } }),
    ]);

    items = questions.map((q) => ({
      id: q.id,
      type: 'question',
      title: q.title,
      slug: q.slug,
      snippet: q.body.replace(/<[^>]+>/g, ' ').slice(0, 180) + '...',
      subjectName: q.subject.name,
      subjectSlug: q.subject.slug,
      views: q.views,
      tags: q.tags,
      score: 0,
      createdAt: q.createdAt.toISOString(),
    }));
    total = count;
  } else if (type === 'notes') {
    const [notes, count] = await Promise.all([
      db.note.findMany({
        where: { status: 'PUBLISHED', ...subjectFilter },
        include: { subject: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      db.note.count({ where: { status: 'PUBLISHED', ...subjectFilter } }),
    ]);

    items = notes.map((n) => ({
      id: n.id,
      type: 'note',
      title: n.title,
      slug: n.slug,
      snippet: n.description.replace(/<[^>]+>/g, ' ').slice(0, 180) + '...',
      subjectName: n.subject.name,
      subjectSlug: n.subject.slug,
      views: 0,
      tags: n.tags,
      score: 0,
      createdAt: n.createdAt.toISOString(),
      fileUrl: n.fileUrl,
      fileType: n.fileType,
      fileSize: n.fileSize,
    }));
    total = count;
  }

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

