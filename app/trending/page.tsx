import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { QuestionCard } from '@/components/QuestionCard';
import { TrendingUp, Search, Flame, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Trending Doubts & Top Searches',
  description:
    'Discover what students are searching and studying most this week on Doubtly.',
};

export default async function TrendingPage() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  let topSearches: any[] = [];
  let mostViewedQuestions: any[] = [];

  try {
    const [tSearches, mQuestions] = await Promise.all([
      db.searchLog.findMany({
        where: {
          lastSearchedAt: { gte: oneWeekAgo },
        },
        orderBy: { count: 'desc' },
        take: 16,
      }),
      db.question.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          subject: true,
          _count: { select: { helpfulVotes: true } },
        },
        orderBy: { views: 'desc' },
        take: 8,
      }),
    ]);
    topSearches = tSearches;
    mostViewedQuestions = mQuestions;
  } catch (error) {
    console.error('Database connection unavailable in TrendingPage:', error);
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl min-h-screen">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
          <Flame className="w-3.5 h-3.5 text-spark" />
          <span>Real-time Learning Pulse</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink dark:text-white tracking-tight">
          Trending Topics & Doubts
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
          Curious minds think alike. Explore what fellow students have searched and viewed most frequently this week.
        </p>
      </div>

      {/* Top Search Cloud */}
      <section className="bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs mb-12">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/70">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-heading font-bold text-lg text-ink dark:text-white">
            Top Searched Queries This Week
          </h2>
        </div>

        {topSearches.length === 0 ? (
          <p className="text-sm text-slate-500">
            Search queries will appear here as students explore the platform.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {topSearches.map((item, idx) => (
              <Link
                key={item.id}
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-all text-sm shadow-2xs"
              >
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  #{idx + 1}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {item.query}
                </span>
                <span className="text-[11px] text-slate-400 bg-white dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                  {item.count} searches
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Most Read Solved Questions */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-ink dark:text-white">
              Most Viewed Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              The questions helping students get unstuck the most
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mostViewedQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              title={q.title}
              slug={q.slug}
              snippet={q.body.replace(/<[^>]+>/g, ' ').slice(0, 160) + '...'}
              subjectName={q.subject.name}
              subjectSlug={q.subject.slug}
              views={q.views}
              helpfulVotes={q._count.helpfulVotes}
              tags={q.tags}
              createdAt={q.createdAt.toISOString()}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

