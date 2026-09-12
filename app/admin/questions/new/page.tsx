import React from 'react';
import { db } from '@/lib/db';
import { QuestionForm } from '../QuestionForm';

export const dynamic = 'force-dynamic';

export default async function NewQuestionPage() {
  const subjects = await db.subject.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  });

  return <QuestionForm subjects={subjects} />;
}

