import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientIp, hashIp } from '@/lib/utils';
import { rateLimit, HELPFUL_RATE_LIMIT } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;
    const clientIp = getClientIp(request.headers);

    // 1. Rate limit helpful votes by IP
    const rateCheck = rateLimit(`helpful_${clientIp}`, HELPFUL_RATE_LIMIT);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many helpful vote requests. Please try again later.' },
        { status: 429 }
      );
    }

    const hashedIp = hashIp(clientIp);

    // 2. Check if question exists
    const question = await db.question.findUnique({
      where: { id: questionId },
      select: { id: true, status: true },
    });

    if (!question || question.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // 3. Check if vote already exists for this hashed IP
    const existingVote = await db.helpfulVote.findUnique({
      where: {
        questionId_ipHash: {
          questionId,
          ipHash: hashedIp,
        },
      },
    });

    let hasVoted = false;
    if (existingVote) {
      // Toggle vote off if clicked again
      await db.helpfulVote.delete({
        where: { id: existingVote.id },
      });
      hasVoted = false;
    } else {
      // Record new helpful vote
      await db.helpfulVote.create({
        data: {
          questionId,
          ipHash: hashedIp,
        },
      });
      hasVoted = true;
    }

    // Fetch total upvote count
    const totalHelpful = await db.helpfulVote.count({
      where: { questionId },
    });

    return NextResponse.json({
      success: true,
      hasVoted,
      helpfulVotes: totalHelpful,
    });
  } catch (error) {
    console.error('Helpful vote POST error:', error);
    return NextResponse.json({ error: 'Failed to record helpful vote' }, { status: 500 });
  }
}

