import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowRight, HelpCircle } from 'lucide-react';

interface RelatedQuestionsProps {
  currentQuestionId: string;
  subjectId: string;
  tags: string[];
}

export async function RelatedQuestions({
  currentQuestionId,
  subjectId,
  tags,
}: RelatedQuestionsProps) {
  let related: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    subject: { name: string };
  }> = [];

  try {
    // 1. Try finding questions that share tags within the same subject or across subjects
    if (tags.length > 0) {
      related = await db.question.findMany({
        where: {
          id: { not: currentQuestionId },
          status: 'PUBLISHED',
          OR: [
            { tags: { hasSome: tags } },
            { subjectId: subjectId },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          subject: { select: { name: true } },
        },
        take: 5,
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      });
    } else {
      related = await db.question.findMany({
        where: {
          id: { not: currentQuestionId },
          subjectId: subjectId,
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          subject: { select: { name: true } },
        },
        take: 5,
        orderBy: { views: 'desc' },
      });
    }
  } catch (err) {
    console.error('Failed to load related questions:', err);
  }

  if (related.length === 0) return null;

  return (
    <div className="bg-slate-50/70 dark:bg-surface-darkCard/50 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-7">
      <div className="flex items-center gap-2 mb-5">
        <HelpCircle className="w-5 h-5 text-primary-500" />
        <h3 className="font-heading font-bold text-lg text-ink dark:text-slate-100">
          Related Doubts & Questions
        </h3>
      </div>

      <div className="space-y-2.5">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/q/${item.slug}`}
            className="group p-3.5 sm:p-4 rounded-xl bg-white dark:bg-surface-darkCard border border-slate-200/70 dark:border-slate-800/70 hover:border-primary-400 dark:hover:border-primary-600 flex items-center justify-between gap-3 transition-all duration-150 shadow-2xs"
          >
            <div className="min-w-0">
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 block mb-1">
                {item.subject.name}
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {item.title}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {item.views.toLocaleString()} views
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

