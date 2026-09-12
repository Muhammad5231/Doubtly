import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { HelpfulButton } from '@/components/HelpfulButton';
import { RelatedQuestions } from '@/components/RelatedQuestions';
import { SolutionActions } from '@/components/SolutionActions';
import { StemRenderer } from '@/components/StemRenderer';
import {
  getCanonicalUrl,
  truncate,
  generateQuestionJsonLd,
  generateBreadcrumbJsonLd,
  extractDirectAnswerVerdict,
  SITE_NAME,
} from '@/lib/seo';
import { formatDate, formatBytes } from '@/lib/utils';
import {
  ChevronRight,
  Eye,
  Calendar,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  FileText,
  Video,
  Download,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const revalidate = 300; // 5-minute ISR window

interface QuestionPageProps {
  params: { slug: string };
}

// Generate static params for top 50 questions for edge CDN instant delivery
export async function generateStaticParams() {
  try {
    const questions = await db.question.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
      orderBy: { views: 'desc' },
      take: 50,
    });
    return questions.map((q) => ({ slug: q.slug }));
  } catch {
    return [];
  }
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

  // Fetch contextual prerequisites, related notes, and video in parallel
  const [contextualNotes, contextualVideos] = await Promise.all([
    db.note.findMany({
      where: { status: 'PUBLISHED', subjectId: question.subjectId },
      select: {
        id: true,
        title: true,
        slug: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    db.video.findMany({
      where: { status: 'PUBLISHED', subjectId: question.subjectId },
      select: {
        id: true,
        title: true,
        youtubeId: true,
      },
      take: 2,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Increment views asynchronously without blocking page render
  db.question
    .update({
      where: { id: question.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error('Failed to increment views:', err));

  const canonicalUrl = getCanonicalUrl(`/q/${question.slug}`);

  // Construct JSON-LD Structured Data (QAPage + BreadcrumbList)
  const questionJsonLd = generateQuestionJsonLd({
    title: question.title,
    body: question.body,
    answer: question.answer,
    dateCreated: question.createdAt.toISOString(),
    upvoteCount: question._count.helpfulVotes,
    url: canonicalUrl,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: question.subject.name, url: `/subject/${question.subject.slug}` },
    { name: question.title, url: `/q/${question.slug}` },
  ]);

  // Extract GEO Direct Answer Verdict and Core Formula for AI Search Engines
  const { formula: geoFormula, verdict: geoVerdict } = extractDirectAnswerVerdict(
    question.title,
    question.answer
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(questionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap font-mono"
        >
          <Link href="/" className="hover:text-indigo-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/subject/${question.subject.slug}`}
            className="hover:text-indigo-500 transition-colors uppercase"
          >
            {question.subject.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">
            {question.title}
          </span>
        </nav>

        {/* 70/30 Focal Reading Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 70% Column (Col 8) */}
          <main className="lg:col-span-8 space-y-8">
            {/* Question Header */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Link
                    href={`/subject/${question.subject.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {question.subject.name}
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(question.createdAt)}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {(question.views + 1).toLocaleString()} views
                  </span>
                </div>

                <SolutionActions
                  title={question.title}
                  solutionText={question.answer}
                />
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                {question.title}
              </h1>
            </header>

            {/* Problem Statement Card */}
            <article className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-tactile">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 pb-3 mb-4 border-b border-slate-100 dark:border-white/[0.05]">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Problem Statement & Context</span>
              </div>

              <StemRenderer content={question.body} />

              {question.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.05] flex flex-wrap gap-1.5">
                  {question.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2.5 py-1 rounded-md hover:text-indigo-500 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </article>

            {/* AI Direct Answer / Generative Engine Optimization (GEO) Semantic Callout */}
            <section
              data-geo="direct-answer"
              aria-label="Direct Answer & Core Formula"
              className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-indigo-950/30 p-5 sm:p-6 backdrop-blur-md shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Direct Answer & Core Formulation</span>
              </div>
              {geoFormula && (
                <div className="mb-3 p-3.5 rounded-xl bg-black/40 border border-cyan-500/20 overflow-x-auto">
                  <StemRenderer content={`$$${geoFormula}$$`} compact />
                </div>
              )}
              <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed">
                {geoVerdict}
              </p>
            </section>

            {/* Verified Step-by-Step Derivation Card */}
            <section
              id="solution"
              className="bg-white dark:bg-[#0D0F17] rounded-2xl border-2 border-amber-500/40 dark:border-amber-500/30 p-6 sm:p-8 shadow-glow-amber relative overflow-hidden"
            >
              {/* Verification Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-white/[0.06] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900 dark:text-white">
                      Verified Step-by-Step Derivation
                    </h2>
                    <p className="text-xs font-mono text-slate-400">
                      Editorial Review • Complete Solution
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 self-start sm:self-center">
                  <ShieldCheck className="w-4 h-4" />
                  Peer-Verified
                </span>
              </div>

              {/* Solution Body */}
              <div className="leading-relaxed font-sans">
                <StemRenderer content={question.answer} />
              </div>

              {/* Helpful Vote & Feedback */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <HelpfulButton
                  questionId={question.id}
                  initialCount={question._count.helpfulVotes}
                />

                <span className="text-xs font-mono text-slate-400">
                  Last verified: {formatDate(question.updatedAt)}
                </span>
              </div>
            </section>

            {/* Related Questions */}
            <div className="pt-4">
              <Suspense
                fallback={
                  <div className="p-8 rounded-2xl bg-white/50 dark:bg-white/[0.02] animate-pulse">
                    <div className="h-6 w-48 bg-slate-200 dark:bg-white/[0.05] rounded mb-4" />
                    <div className="space-y-3">
                      <div className="h-16 bg-slate-200 dark:bg-white/[0.05] rounded" />
                      <div className="h-16 bg-slate-200 dark:bg-white/[0.05] rounded" />
                    </div>
                  </div>
                }
              >
                <RelatedQuestions
                  currentQuestionId={question.id}
                  subjectId={question.subjectId}
                  tags={question.tags}
                />
              </Suspense>
            </div>
          </main>

          {/* Sticky 30% Contextual Knowledge Rail (Col 4) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Table of Contents & Quick Jump */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Quick Index</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <a
                  href="#"
                  className="block px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  1. Problem Statement
                </a>
                <a
                  href="#solution"
                  className="block px-3 py-2 rounded-xl font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20"
                >
                  2. Step-by-Step Solution
                </a>
                <Link
                  href={`/subject/${question.subject.slug}`}
                  className="block px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  3. {question.subject.name} Directory
                </Link>
              </div>
            </div>

            {/* Related High-Yield PDF Notes */}
            {contextualNotes.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.05]">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Revision Sheets</span>
                  </h3>
                  <Link
                    href={`/notes`}
                    className="text-[11px] font-bold text-cyan-500 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {contextualNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/notes/${note.slug}`}
                          className="font-medium text-xs text-slate-800 dark:text-slate-200 hover:text-cyan-500 line-clamp-1 block"
                        >
                          {note.title}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400">
                          {formatBytes(note.fileSize)}
                        </span>
                      </div>
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="p-1.5 rounded-lg text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                        title="Download Note"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Video Breakdowns */}
            {contextualVideos.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.05]">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Lessons</span>
                  </h3>
                  <Link
                    href="/videos"
                    className="text-[11px] font-bold text-amber-500 hover:underline"
                  >
                    More
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {contextualVideos.map((v) => (
                    <a
                      key={v.id}
                      href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/vid p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] flex items-center gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="relative w-14 h-9 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                        <Image
                          src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                          alt={v.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/vid:text-amber-500 line-clamp-1">
                          {v.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          Watch on YouTube <ArrowUpRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
