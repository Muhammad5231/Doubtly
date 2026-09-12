import React from 'react';
import { db } from '@/lib/db';
import { SubjectManagerClient } from './SubjectManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSubjectsPage() {
  const subjects = await db.subject.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { questions: true, notes: true, videos: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-ink dark:text-white">
          Subjects Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Create and organize academic subject categories
        </p>
      </div>

      <SubjectManagerClient
        initialSubjects={subjects.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          order: s.order,
          questionCount: s._count.questions,
          noteCount: s._count.notes,
          videoCount: s._count.videos,
        }))}
      />
    </div>
  );
}

