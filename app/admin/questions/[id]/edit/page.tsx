import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { QuestionForm } from '../../QuestionForm';

export const dynamic = 'force-dynamic';

interface EditQuestionPageProps {
  params: { id: string };
}

export default async function EditQuestionPage({
  params,
}: EditQuestionPageProps) {
  const [question, subjects] = await Promise.all([
    db.question.findUnique({
      where: { id: params.id },
    }),
    db.subject.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!question) {
    notFound();
  }

  return (
    <QuestionForm
      subjects={subjects}
      initialData={{
        id: question.id,
        title: question.title,
        slug: question.slug,
        subjectId: question.subjectId,
        body: question.body,
        answer: question.answer,
        tags: question.tags,
        status: question.status,
      }}
    />
  );
}

