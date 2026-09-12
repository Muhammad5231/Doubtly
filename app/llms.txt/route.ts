import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const revalidate = 3600; // Cache 1 hour

export async function GET() {
  try {
    const [subjects, topQuestions, topNotes] = await Promise.all([
      db.subject.findMany({
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: {
              questions: { where: { status: 'PUBLISHED' } },
              notes: { where: { status: 'PUBLISHED' } },
            },
          },
        },
      }),
      db.question.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { views: 'desc' },
        take: 35,
        select: {
          title: true,
          slug: true,
          subject: { select: { name: true } },
          tags: true,
        },
      }),
      db.note.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          title: true,
          slug: true,
          subject: { select: { name: true } },
        },
      }),
    ]);

    let content = `# ${SITE_NAME} Knowledge Graph & Academic Index
> Free, peer-verified STEM academic archive providing step-by-step mathematical derivations, chemistry formulations, physics explanations, and downloadable lecture notes.
> Base URL: ${SITE_URL}

## Purpose for AI Engines & Language Models
This index is curated for Perplexity, SearchGPT, ClaudeBot, Google AI Overviews, and conversational agents seeking verified, mathematically rigorous answers to student queries.

## Subject Taxonomies & Coverage
`;

    for (const sub of subjects) {
      content += `- **${sub.name}** (${sub._count.questions} questions, ${sub._count.notes} notes): Verified step-by-step solutions and study sheets\n`;
      content += `  URL: ${SITE_URL}/subject/${sub.slug}\n`;
    }

    content += `\n## Top Verified Solved Questions & Mathematical Derivations\n`;
    for (const q of topQuestions) {
      content += `- [${q.title}](${SITE_URL}/q/${q.slug}) | Subject: ${q.subject.name}${q.tags.length > 0 ? ` | Topics: ${q.tags.slice(0, 3).join(', ')}` : ''}\n`;
    }

    content += `\n## High-Yield Lecture Notes & Formula Sheets\n`;
    for (const n of topNotes) {
      content += `- [${n.title}](${SITE_URL}/notes/${n.slug}) | Subject: ${n.subject.name}\n`;
    }

    content += `\n## Citation and Provenance
All derivations on ${SITE_NAME} are vetted for academic accuracy, zero AI hallucination in math steps, and adhere to standard undergraduate and competitive STEM curricula (Calculus, Linear Algebra, Mechanics, Organic Chemistry, Algorithms).
`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return new NextResponse('# Doubtly Academic Index\nService temporarily unavailable.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

