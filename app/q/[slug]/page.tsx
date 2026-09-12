import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { HelpfulButton } from '@/components/HelpfulButton';
import { RelatedQuestions } from '@/components/RelatedQuestions';
import { SolutionActions } from '@/components/SolutionActions';
import { Badge } from '@/components/ui/badge';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  getCanonicalUrl,
  truncate,
  generateQuestionJsonLd,
  SITE_NAME,
} from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import {
  ChevronRight,
  Eye,
  Calendar,
  CheckCircle2,
  Share2,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

interface QuestionPageProps {
  params: { slug: string };
}

// Dynamic SEO Metadata Generator
export async function generateMetadata({
  params,
}: QuestionPageProps): Promise<Metadata> {
  const question = await db.question.findUnique({
    where: { slug: params.slug },
    include: { subject: true },
  });

  if (!question || question.status !== 'PUBLISHED') {
    return { title: 'Question Not Found' };
  }

  const title = question.title;
  const description = truncate(question.answer, 155);
  const canonicalUrl = getCanonicalUrl(`/q/${question.slug}`);

  return {
    title: `${title} | Doubtly Solution`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: SITE_NAME,
      publishedTime: question.createdAt.toISOString(),
      modifiedTime: question.updatedAt.toISOString(),
      section: question.subject.name,
      tags: question.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const question = await db.question.findUnique({
    where: { slug: params.slug },
    include: {
      subject: true,
      _count: { select: { helpfulVotes: true } },
    },
  });

  if (!question || question.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment views asynchronously
  db.question
    .update({
      where: { id: question.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error('Failed to increment views:', err));

  const canonicalUrl = getCanonicalUrl(`/q/${question.slug}`);

  // Construct JSON-LD Structured Data
  const jsonLd = generateQuestionJsonLd({
    title: question.title,
    body: question.body,
    answer: question.answer,
    dateCreated: question.createdAt.toISOString(),
    upvoteCount: question._count.helpfulVotes,
    url: canonicalUrl,
  });

  return (
    <>
      {/* Schema.org QAPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/subject/${question.subject.slug}`}
            className="hover:text-primary-600 transition-colors"
          >
            {question.subject.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">
            {question.title}
          </span>
        </nav>

        {/* Question Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Link
                href={`/subject/${question.subject.slug}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/70 dark:text-primary-300 border border-primary-100 dark:border-primary-900/60 hover:bg-primary-100 dark:hover:bg-primary-900/80 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {question.subject.name}
              </Link>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(question.createdAt)}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {(question.views + 1).toLocaleString()} views
              </span>
            </div>

            {/* Quick Actions Toolbar */}
            <SolutionActions
              title={question.title}
              solutionText={question.answer}
            />
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-ink dark:text-white tracking-tight leading-tight">
            {question.title}
          </h1>
        </header>

        {/* Question Body Card */}
        <article className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/70">
            <BookOpen className="w-3.5 h-3.5 text-primary-500" />
            <span>Question Statement</span>
          </div>
          <div
            className="prose-content text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.body) }}
          />

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Accepted Answer Section */}
        <section
          id="answer"
          className="bg-white dark:bg-surface-darkCard rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/30 p-6 sm:p-8 shadow-md mb-10 relative overflow-hidden"
        >
          {/* Top Verification Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/80 gap-2">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-ink dark:text-white">
                  Step-by-Step Verified Solution
                </h2>
                <p className="text-xs text-slate-400">
                  Detailed mathematical and conceptual derivation
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 self-start sm:self-center">
              <ShieldCheck className="w-3.5 h-3.5" />
              Academic Review Verified
            </span>
          </div>

          <div
            className="prose-content text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.answer) }}
          />

          {/* Feedback & Helpful Vote Button */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <HelpfulButton
              questionId={question.id}
              initialCount={question._count.helpfulVotes}
            />

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Last updated: {formatDate(question.updatedAt)}</span>
            </div>
          </div>
        </section>

        {/* Related Questions Block */}
        <div className="mb-12">
          <RelatedQuestions
            currentQuestionId={question.id}
            subjectId={question.subjectId}
            tags={question.tags}
          />
        </div>
      </div>
    </>
  );
}

