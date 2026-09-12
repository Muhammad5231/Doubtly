import React, { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { SearchBox } from '@/components/SearchBox';
import { QuestionCard } from '@/components/QuestionCard';
import { NoteCard } from '@/components/NoteCard';
import { VideoCard } from '@/components/VideoCard';
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
  Calculator,
  Atom,
  FlaskConical,
  Binary,
  Dna,
  Layers,
  Flame,
} from 'lucide-react';

export const revalidate = 300; // 5-minute ISR window

// Helper for subject icons
function getSubjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
    return <Calculator className="w-5 h-5 text-indigo-500" />;
  }
  if (lower.includes('physic')) {
    return <Atom className="w-5 h-5 text-cyan-500" />;
  }
  if (lower.includes('chem')) {
    return <FlaskConical className="w-5 h-5 text-emerald-500" />;
  }
  if (lower.includes('comput') || lower.includes('code') || lower.includes('program')) {
    return <Binary className="w-5 h-5 text-violet-500" />;
  }
  if (lower.includes('bio')) {
    return <Dna className="w-5 h-5 text-rose-500" />;
  }
  return <GraduationCap className="w-5 h-5 text-indigo-500" />;
}

export default async function HomePage() {
  let subjects: any[] = [];
  let trendingQuestions: any[] = [];
  let latestNotes: any[] = [];
  let featuredVideos: any[] = [];

  try {
    const [subs, tQs, lNotes, fVids] = await Promise.all([
      // Pruned query: Subjects with counts
      db.subject.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
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

      // Pruned query: Top trending questions
      db.question.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          body: true,
          views: true,
          tags: true,
          createdAt: true,
          subject: { select: { name: true, slug: true } },
          _count: { select: { helpfulVotes: true } },
        },
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),

      // Pruned query: Recent high-yield notes
      db.note.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
          tags: true,
          createdAt: true,
          subject: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),

      // Pruned query: Featured video lectures
      db.video.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          youtubeId: true,
          description: true,
          createdAt: true,
          subject: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    subjects = subs;
    trendingQuestions = tQs;
    latestNotes = lNotes;
    featuredVideos = fVids;
  } catch (error) {
    console.error('Database query fallback:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero: Obsidian Command Terminal Experience */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/80 dark:border-white/[0.06]">
        {/* Subtle Ambient Radial Shaders */}
        <div className="absolute inset-0 bg-grid-slate pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-amber-500/10 blur-[100px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 text-xs font-semibold mb-6 border border-slate-200 dark:border-white/[0.08] shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Academic Archive
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">100% Free & No Login</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1] mb-6">
            Every doubt,{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              solved.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
            High-precision, verified step-by-step solutions, downloadable PDF formula sheets,
            and curated video lectures for curious minds and students.
          </p>

          {/* Floating Command Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBox large autoFocus />
          </div>

          {/* Quick-Filter Pills with Micro-Animations */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/search?type=questions"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs hover:scale-102"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              Verified Solutions
            </Link>

            <Link
              href="/notes"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-xs hover:scale-102"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-500" />
              Lecture Notes
            </Link>

            <Link
              href="/videos"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-xs hover:scale-102"
            >
              <Video className="w-3.5 h-3.5 text-amber-500" />
              Video Breakdowns
            </Link>

            <Link
              href="/search?q=exam"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs hover:scale-102"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Past Exam Questions
            </Link>
          </div>
        </div>
      </section>

      {/* Proof Points Strip */}
      <section className="border-b border-slate-200/80 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.01] py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                100% Free
              </div>
              <p className="text-xs text-slate-500 font-medium">No paywalls or student credits</p>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400">
                Zero Login
              </div>
              <p className="text-xs text-slate-500 font-medium">Instant anonymous browsing</p>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-500">
                Peer-Verified
              </div>
              <p className="text-xs text-slate-500 font-medium">Academic editorial quality review</p>
            </div>
            <div className="space-y-1">
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-cyan-500">
                Sub-100ms
              </div>
              <p className="text-xs text-slate-500 font-medium">Edge-cached indexed search</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Subjects Bento Grid */}
      <section className="py-14 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic Disciplines</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
                Explore by Subject
              </h2>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <span>View All Solutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => {
              const totalItems = sub._count.questions + sub._count.notes + sub._count.videos;
              return (
                <Link
                  key={sub.id}
                  href={`/subject/${sub.slug}`}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/40 shadow-tactile hover:shadow-glow-subtle transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      {getSubjectIcon(sub.name)}
                    </div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{totalItems} items</span>
                    <span className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Solved Doubts */}
      <section className="py-14 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>High-Yield Solved Doubts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
                Trending Questions
              </h2>
            </div>

            <Link
              href="/trending"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <span>Explore All Trending</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trendingQuestions.map((q) => {
              const cleanSnippet = q.body
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 160);

              return (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  title={q.title}
                  slug={q.slug}
                  snippet={cleanSnippet ? `${cleanSnippet}...` : undefined}
                  subjectName={q.subject.name}
                  subjectSlug={q.subject.slug}
                  views={q.views}
                  helpfulVotes={q._count.helpfulVotes}
                  tags={q.tags}
                  createdAt={q.createdAt.toISOString()}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Study Notes & Video Lectures Dual Grid */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Latest Notes (Col 7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Downloadable Resources</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">
                    High-Yield PDF Notes
                  </h3>
                </div>
                <Link
                  href="/notes"
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Video Lectures (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>Concept Breakdowns</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">
                    Video Lessons
                  </h3>
                </div>
                <Link
                  href="/videos"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
