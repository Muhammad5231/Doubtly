import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { SearchBox } from '@/components/SearchBox';
import { QuestionCard } from '@/components/QuestionCard';
import { NoteCard } from '@/components/NoteCard';
import { VideoCard } from '@/components/VideoCard';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  Video,
  CheckCircle2,
  GraduationCap,
  Zap,
  ShieldCheck,
  DownloadCloud,
  Layers,
  Atom,
  Binary,
  Calculator,
  FlaskConical,
  Dna,
} from 'lucide-react';

export const revalidate = 3600; // ISR: 1 hour cache

// Helper to choose thematic icon per subject
function getSubjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
    return <Calculator className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
  }
  if (lower.includes('physic')) {
    return <Atom className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
  }
  if (lower.includes('chem')) {
    return <FlaskConical className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
  }
  if (lower.includes('comput') || lower.includes('code') || lower.includes('program')) {
    return <Binary className="w-6 h-6 text-violet-600 dark:text-violet-400" />;
  }
  if (lower.includes('bio')) {
    return <Dna className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
  }
  return <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />;
}

export default async function HomePage() {
  let subjects: any[] = [];
  let trendingQuestions: any[] = [];
  let latestNotes: any[] = [];
  let featuredVideos: any[] = [];

  try {
    const [subs, tQs, lNotes, fVids] = await Promise.all([
      db.subject.findMany({
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
        take: 8,
      }),
      db.question.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          subject: true,
          _count: { select: { helpfulVotes: true } },
        },
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),
      db.note.findMany({
        where: { status: 'PUBLISHED' },
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
      db.video.findMany({
        where: { status: 'PUBLISHED' },
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    subjects = subs;
    trendingQuestions = tQs;
    latestNotes = lNotes;
    featuredVideos = fVids;
  } catch (error) {
    console.error('Database connection unavailable during render in HomePage:', error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Ambient Glow and Pattern */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-primary-50/50 via-background to-background dark:from-surface-darkCard/25">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-grid-slate pointer-events-none opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

        {/* Ambient colored mesh blurs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-tr from-primary-500/15 via-secondary-500/15 to-spark/20 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          {/* Tagline Badge with Amber Spark */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-surface-darkCard text-slate-800 dark:text-slate-200 text-xs font-semibold mb-6 border border-slate-200 dark:border-slate-700/80 shadow-xs animate-in fade-in-50">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spark opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-spark" />
            </span>
            <span>100% Free Academic Archive</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-primary-600 dark:text-primary-400 font-bold">Zero Sign-up Required</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-ink dark:text-white leading-[1.12] mb-6">
            Every doubt,{' '}
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
              solved.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Instant step-by-step academic solutions, downloadable PDF revision sheets,
            and curated video lectures to help you master challenging concepts.
          </p>

          {/* Elevated Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBox large autoFocus />
          </div>

          {/* Quick Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-10">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Popular:
            </span>
            {[
              'Calculus differentiation',
              'Newton laws',
              'Organic reactions',
              'Binary search tree',
              'Thermodynamics',
            ].map((query) => (
              <Link
                key={query}
                href={`/search?q=${encodeURIComponent(query)}`}
                className="bg-white dark:bg-surface-darkCard px-3 py-1 rounded-full border border-slate-200/90 dark:border-slate-700/80 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-2xs font-medium"
              >
                {query}
              </Link>
            ))}
          </div>

          {/* Proof Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-left">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-surface-darkCard/70 border border-slate-200/60 dark:border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Verified</p>
                <p className="text-[11px] text-slate-400">Step-by-step proofs</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-surface-darkCard/70 border border-slate-200/60 dark:border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-secondary-50 dark:bg-secondary-950/60 text-secondary-600 dark:text-secondary-400 flex items-center justify-center flex-shrink-0">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Free PDFs</p>
                <p className="text-[11px] text-slate-400">Notes & summaries</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-surface-darkCard/70 border border-slate-200/60 dark:border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Fast Search</p>
                <p className="text-[11px] text-slate-400">PostgreSQL trigram</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-surface-darkCard/70 border border-slate-200/60 dark:border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Open Access</p>
                <p className="text-[11px] text-slate-400">Zero barriers or fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid Section */}
      <section className="py-16 md:py-24 bg-slate-50/50 dark:bg-surface-dark/40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Knowledge Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink dark:text-white">
                Explore by Subject
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 md:mt-0 max-w-md">
              Comprehensive curriculum modules filled with structured solutions, formula sheets, and verified notes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {subjects.map((sub) => {
              const totalItems =
                sub._count.questions + sub._count.notes + sub._count.videos;
              return (
                <Link
                  key={sub.id}
                  href={`/subject/${sub.slug}`}
                  className="group relative bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 hover:border-primary-500/80 dark:hover:border-primary-500/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs border border-slate-200/60 dark:border-slate-700/60">
                      {getSubjectIcon(sub.name)}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-ink dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {sub._count.questions} questions
                      </span>
                      <span>•</span>
                      <span>{sub._count.notes} notes</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Doubts / Questions */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Community Favorite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink dark:text-white">
              Trending Doubts & Questions
            </h2>
          </div>

          <Link
            href="/search?type=questions"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Browse all questions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trendingQuestions.map((q) => (
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

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/search?type=questions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600"
          >
            Browse all questions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Latest Notes & PDFs */}
      {latestNotes.length > 0 && (
        <section className="py-16 bg-slate-50/50 dark:bg-surface-dark/30 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-600 dark:text-secondary-400 mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Free Downloads</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink dark:text-white">
                  Latest Study Notes & Formula Sheets
                </h2>
              </div>

              <Link
                href="/notes"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-600 dark:text-secondary-400 hover:underline"
              >
                View all notes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  slug={note.slug}
                  description={note.description}
                  subjectName={note.subject.name}
                  subjectSlug={note.subject.slug}
                  fileUrl={note.fileUrl}
                  fileType={note.fileType}
                  fileSize={note.fileSize}
                  tags={note.tags}
                  createdAt={note.createdAt.toISOString()}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Video Lessons */}
      {featuredVideos.length > 0 && (
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
                <Video className="w-3.5 h-3.5" />
                <span>Visual Learning</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink dark:text-white">
                Featured Video Lectures
              </h2>
            </div>

            <Link
              href="/videos"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Browse all videos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                youtubeId={video.youtubeId}
                description={video.description}
                subjectName={video.subject.name}
                subjectSlug={video.subject.slug}
                createdAt={video.createdAt.toISOString()}
              />
            ))}
          </div>
        </section>
      )}

      {/* Platform Value Proposition Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-slate-50/60 dark:via-surface-darkCard/20 to-transparent border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-spark" />
              <span>The Doubtly Standard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink dark:text-white tracking-tight">
              Learning without artificial barriers
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-3">
              Designed from the ground up for students who need clear, accurate academic answers without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-surface-darkCard p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink dark:text-white mb-2">
                Step-by-Step Verified
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear solutions that explain underlying theorems, intermediate calculations, and final answers.
              </p>
            </div>

            <div className="bg-white dark:bg-surface-darkCard p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-secondary-50 dark:bg-secondary-950/60 text-secondary-600 dark:text-secondary-400 flex items-center justify-center mb-5">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink dark:text-white mb-2">
                Downloadable PDFs
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Formula sheets, chapter summaries, and revision guides you can download and keep forever.
              </p>
            </div>

            <div className="bg-white dark:bg-surface-darkCard p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-ink dark:text-white mb-2">
                Zero Friction
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No signups, no subscriptions, and no paywalls. Instant search and reading for every student.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

