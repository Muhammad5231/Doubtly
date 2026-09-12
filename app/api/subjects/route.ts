import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const subjects = await db.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            questions: { where: { status: 'PUBLISHED' } },
            notes: { where: { status: 'PUBLISHED' } },
            videos: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    const formatted = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      icon: s.icon,
      order: s.order,
      counts: {
        questions: s._count.questions,
        notes: s._count.notes,
        videos: s._count.videos,
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Subjects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

