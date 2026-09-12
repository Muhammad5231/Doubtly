import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { QuestionCard } from '@/components/QuestionCard';
import { NoteCard } from '@/components/NoteCard';
import { VideoCard } from '@/components/VideoCard';
import { Badge } from '@/components/ui/badge';
import { getCanonicalUrl, SITE_NAME } from '@/lib/seo';
import {
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  GraduationCap,
  ChevronRight,
  Calculator,
  Atom,
  FlaskConical,
  Binary,
  Dna,
} from 'lucide-react';

export const revalidate = 3600;

function getSubjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
    return <Calculator className="w-8 h-8 text-white" />;
  }
  if (lower.includes('physic')) {
    return <Atom className="w-8 h-8 text-white" />;
  }
  if (lower.includes('chem')) {
    return <FlaskConical className="w-8 h-8 text-white" />;
  }
  if (lower.includes('comput') || lower.includes('code') || lower.includes('program')) {
    return <Binary className="w-8 h-8 text-white" />;
  }
  if (lower.includes('bio')) {
    return <Dna className="w-8 h-8 text-white" />;
  }
  return <GraduationCap className="w-8 h-8 text-white" />;
}

interface SubjectPageProps {
  params: { slug: string };
  searchParams: { tab?: 'questions' | 'notes' | 'videos' };
}

export async function generateMetadata({
  params,
}: SubjectPageProps): Promise<Metadata> {
  const subject = await db.subject.findUnique({
    where: { slug: params.slug },
  });

  if (!subject) return { title: 'Subject Not Found' };

  const title = `${subject.name} Doubts, Solutions & Notes`;
  const description = `Explore verified solutions, PDF study notes, and concept videos for ${subject.name} on Doubtly.`;
  const canonicalUrl = getCanonicalUrl(`/subject/${subject.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
    },
  };
}

export default async function SubjectPage({
  params,
  searchParams,
}: SubjectPageProps) {
  const activeTab = searchParams.tab || 'questions';

  const subject = await db.subject.findUnique({
    where: { slug: params.slug },
    include: {
      questions: {
        where: { status: 'PUBLISHED' },
        include: { _count: { select: { helpfulVotes: true } } },
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      },
      notes: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
      },
      videos: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-1.5 text-xs text-slate-500 mb-6"
      >
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">
          {subject.name}
        </span>
      </nav>

      {/* Subject Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/15 via-primary-50/50 dark:via-surface-darkCard to-background rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 mb-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
            {getSubjectIcon(subject.name)}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink dark:text-white tracking-tight">
              {subject.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {subject.questions.length} Solved Questions
              </span>
              <span>•</span>
              <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                {subject.notes.length} Study Notes
              </span>
              <span>•</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {subject.videos.length} Video Lessons
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800/80 mb-8 pb-1">
        <Link
          href={`/subject/${subject.slug}?tab=questions`}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'questions'
              ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/60 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Questions ({subject.questions.length})
        </Link>

        <Link
          href={`/subject/${subject.slug}?tab=notes`}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'notes'
              ? 'bg-secondary-50 dark:bg-secondary-950/60 text-secondary-700 dark:text-secondary-300 border border-secondary-100 dark:border-secondary-900/60 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notes & PDFs ({subject.notes.length})
        </Link>

        <Link
          href={`/subject/${subject.slug}?tab=videos`}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'videos'
              ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/60 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Video className="w-4 h-4" />
          Videos ({subject.videos.length})
        </Link>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'questions' && (
          <div>
            {subject.questions.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                No questions published yet in {subject.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subject.questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    id={q.id}
                    title={q.title}
                    slug={q.slug}
                    snippet={q.body.replace(/<[^>]+>/g, ' ').slice(0, 160) + '...'}
                    subjectName={subject.name}
                    subjectSlug={subject.slug}
                    views={q.views}
                    helpfulVotes={q._count.helpfulVotes}
                    tags={q.tags}
                    createdAt={q.createdAt.toISOString()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            {subject.notes.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                No notes published yet in {subject.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subject.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    slug={note.slug}
                    description={note.description}
                    subjectName={subject.name}
                    subjectSlug={subject.slug}
                    fileUrl={note.fileUrl}
                    fileType={note.fileType}
                    fileSize={note.fileSize}
                    tags={note.tags}
                    createdAt={note.createdAt.toISOString()}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            {subject.videos.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                No video lessons published yet in {subject.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subject.videos.map((vid) => (
                  <VideoCard
                    key={vid.id}
                    id={vid.id}
                    title={vid.title}
                    youtubeId={vid.youtubeId}
                    description={vid.description}
                    subjectName={subject.name}
                    subjectSlug={subject.slug}
                    createdAt={vid.createdAt.toISOString()}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

