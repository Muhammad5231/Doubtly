import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeHtml } from '@/lib/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;

    const question = await db.question.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier },
        ],
      },
      include: {
        subject: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: {
          select: { helpfulVotes: true },
        },
      },
    });

    if (!question || question.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Increment view count asynchronously
    db.question
      .update({
        where: { id: question.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error('Failed to increment question views:', err));

    return NextResponse.json({
      id: question.id,
      title: question.title,
      slug: question.slug,
      body: sanitizeHtml(question.body),
      answer: sanitizeHtml(question.answer),
      tags: question.tags,
      views: question.views + 1,
      helpfulVotes: question._count.helpfulVotes,
      subject: question.subject,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Question GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

