import React, { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { SearchBox } from '@/components/SearchBox';
import { QuestionCard } from '@/components/QuestionCard';
import { NoteCard } from '@/components/NoteCard';
import { VideoCard } from '@/components/VideoCard';
import { StemRenderer } from '@/components/StemRenderer';
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
  Search,
  ExternalLink,
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

const TRENDING_CHIPS = [
  'Chain Rule Derivation',
  'Schrödinger Wave Equation',
  'Le Chatelier Equilibrium',
  'Integration by Parts',
  'Binary Search Trees',
];

export default async function HomePage() {
  let subjects: any[] = [];
  let trendingQuestions: any[] = [];
  let latestNotes: any[] = [];
  let featuredVideos: any[] = [];

  try {
    const [subs, tQs, lNotes, fVids] = await Promise.all([
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

      db.question.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          body: true,
          answer: true,
          views: true,
          tags: true,
          createdAt: true,
          subject: { select: { name: true, slug: true } },
          _count: { select: { helpfulVotes: true } },
        },
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),

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
        take: 3,
      }),

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

  // Top spotlight question for Tile 1 formula preview
  const spotlightQuestion = trendingQuestions[0];
  const spotlightFormula = spotlightQuestion?.answer?.match(/\$\$([^$]+)\$\$/)?.[0] || '$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors font-sans">
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
          <div className="max-w-2xl mx-auto mb-5">
            <SearchBox large autoFocus />
          </div>

          {/* Live Trending Query Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-500" /> Trending:
            </span>
            {TRENDING_CHIPS.map((chip) => (
              <Link
                key={chip}
                href={`/search?q=${encodeURIComponent(chip)}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-102"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Middle: Bento Grid Discovery Architecture */}
      <section className="py-16 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-indigo-500 font-bold flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5" /> Bento Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
                Academic Discovery Portal
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Browse All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tile 1 (Large 7-Cols): Trending Formulas & Problem Breakdowns with live LaTeX */}
            <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-white to-slate-50 dark:from-[#0D0F17] dark:via-[#0D0F17] dark:to-[#07090F] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                    <Flame className="w-3.5 h-3.5" /> Tile 1 • Trending STEM Breakdown
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {spotlightQuestion?.views || 1200}+ views
                  </span>
                </div>

                <Link
                  href={spotlightQuestion ? `/q/${spotlightQuestion.slug}` : '/search'}
                  className="block group-hover:text-indigo-500 transition-colors"
                >
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                    {spotlightQuestion?.title || 'Gaussian Integral & Multivariable Probability Distribution'}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {spotlightQuestion?.body?.slice(0, 160) ||
                    'Step-by-step verified integration across infinite bounds using Cartesian to Polar coordinates.'}
                </p>

                {/* Live LaTeX Formula Preview */}
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 overflow-x-auto">
                  <StemRenderer content={spotlightFormula} compact />
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Derivation Available</span>
                </div>
                <Link
                  href={spotlightQuestion ? `/q/${spotlightQuestion.slug}` : '/search'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Inspect Derivation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tile 2 (5-Cols): Quick Subject Portals with glowing neon badges */}
            <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Atom className="w-3.5 h-3.5" /> Tile 2 • Subject Portals
                  </span>
                  <Link
                    href="/search"
                    className="text-[11px] font-mono text-indigo-500 hover:underline"
                  >
                    All 5 Disciplines
                  </Link>
                </div>

                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">
                  Instant Subject Gateways
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {subjects.slice(0, 4).map((sub) => {
                    const count = sub._count.questions + sub._count.notes;
                    return (
                      <Link
                        key={sub.id}
                        href={`/subject/${sub.slug}`}
                        className="group/item p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-cyan-500/50 hover:bg-cyan-500/[0.03] transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.05] flex items-center justify-center mb-2 shadow-xs group-hover/item:scale-110 transition-transform">
                          {getSubjectIcon(sub.name)}
                        </div>
                        <div className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {sub.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-1">
                          {count} resources
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Free Open Access</span>
                <Link
                  href="/search?type=questions"
                  className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                >
                  Search Doubts &rarr;
                </Link>
              </div>
            </div>

            {/* Tile 3 (12-Cols): High-Yield Notes of the Week */}
            <div className="lg:col-span-12 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                      Tile 3 • High-Yield Notes of the Week
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Downloadable verified lecture summaries & formula sheets
                    </p>
                  </div>
                </div>

                <Link
                  href="/notes"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline self-start sm:self-center"
                >
                  <span>View All PDF Sheets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {latestNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                        <span className="uppercase text-amber-600 dark:text-amber-400 font-bold">
                          {note.subject.name}
                        </span>
                        <span>{note.fileType || 'PDF'}</span>
                      </div>
                      <Link
                        href={`/notes/${note.slug}`}
                        className="font-heading font-bold text-sm text-slate-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-2 mb-2"
                      >
                        {note.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/[0.04] flex items-center justify-between">
                      <Link
                        href={`/notes/${note.slug}`}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-500 flex items-center gap-1"
                      >
                        Read Note <ArrowRight className="w-3 h-3" />
                      </Link>
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                        title="Direct Download"
                      >
                        <DownloadCloud className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom: Recent Community Solved Questions */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Peer-Reviewed Knowledge Base</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
                Recent Solved Academic Questions
              </h2>
            </div>

            <Link
              href="/search?type=questions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <span>Explore All Questions</span>
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
    </div>
  );
}
