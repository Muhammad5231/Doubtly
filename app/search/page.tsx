import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { searchContent } from '@/lib/search/rank';
import { SearchBox } from '@/components/SearchBox';
import { QuestionCard } from '@/components/QuestionCard';
import { NoteCard } from '@/components/NoteCard';
import { SearchFacetBar, SubjectItem } from '@/components/SearchFacetBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  HelpCircle,
  FileText,
  Layers,
  X,
} from 'lucide-react';

// Thin content: enforce noindex per SEO requirements
export const metadata: Metadata = {
  title: 'Search Doubts & Notes',
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    subject?: string;
    format?: 'all' | 'questions' | 'notes';
    type?: 'all' | 'questions' | 'notes';
    sort?: 'relevance' | 'newest' | 'views' | 'helpful';
    hasMath?: string;
    verified?: string;
    difficulty?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const subjectSlug = searchParams.subject;
  const type = (searchParams.format || searchParams.type || 'all') as 'all' | 'questions' | 'notes';
  const sort = searchParams.sort || 'relevance';
  const hasMath = searchParams.hasMath === 'true';
  const verifiedOnly = searchParams.verified === 'true';
  const difficulty = searchParams.difficulty;
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const limit = 10;

  const [searchResults, rawSubjects, totalQuestionCount, totalNoteCount] = await Promise.all([
    searchContent({
      query,
      subjectSlug,
      type,
      sort,
      hasMath,
      verifiedOnly,
      difficulty,
      page,
      limit,
    }),
    db.subject.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            questions: { where: { status: 'PUBLISHED' } },
            notes: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    }),
    db.question.count({ where: { status: 'PUBLISHED' } }),
    db.note.count({ where: { status: 'PUBLISHED' } }),
  ]);

  const subjects: SubjectItem[] = rawSubjects.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    questionCount: s._count.questions,
    noteCount: s._count.notes,
  }));

  const { items, total, totalPages } = searchResults;

  // Active Filter Helper
  const currentSubject = subjects.find((s) => s.slug === subjectSlug);

  return (
    <div className="min-h-screen pb-20 font-sans">
      {/* Top Search Command Header */}
      <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-200/80 dark:border-white/[0.06] bg-gradient-to-b from-slate-50 via-white to-white dark:from-[#0E111A] dark:via-[#090A0F] dark:to-[#090A0F]">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="max-w-3xl mx-auto mb-4">
            <SearchBox initialValue={query} large autoFocus={!query} />
          </div>

          {/* Quick Active Filter Badges */}
          {(subjectSlug || hasMath || verifiedOnly || difficulty || (type && type !== 'all')) && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Active:</span>
              {currentSubject && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[11px] font-mono">
                  {currentSubject.name}
                  <Link href={`/search?q=${encodeURIComponent(query)}`}>
                    <X className="w-3 h-3 hover:text-indigo-700" />
                  </Link>
                </span>
              )}
              {hasMath && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-mono">
                  LaTeX Math
                </span>
              )}
              {verifiedOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-mono">
                  Peer-Verified
                </span>
              )}
              {difficulty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[11px] font-mono capitalize">
                  {difficulty}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Faceted Filter Bar (Desktop sticky + mobile drawer) */}
          <div className="lg:col-span-4">
            <SearchFacetBar subjects={subjects} totalResults={total} />
          </div>

          {/* Right Column: Results Stream */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header: Results count and status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.06] text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {total} {total === 1 ? 'Result' : 'Results'} Found
                </span>
                {query && (
                  <span>
                    for &ldquo;<span className="text-indigo-500 font-bold">{query}</span>&rdquo;
                  </span>
                )}
              </div>
              <div>
                Page {page} of {Math.max(1, totalPages)}
              </div>
            </div>

            {/* Results Stream */}
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => {
                  if (item.type === 'question') {
                    return (
                      <QuestionCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        slug={item.slug}
                        snippet={item.snippet}
                        subjectName={item.subjectName}
                        subjectSlug={item.subjectSlug}
                        views={item.views}
                        tags={item.tags}
                        createdAt={item.createdAt}
                        highlightedSnippet={item.snippet}
                      />
                    );
                  }
                  return (
                    <NoteCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      slug={item.slug}
                      description={item.snippet}
                      subjectName={item.subjectName}
                      subjectSlug={item.subjectSlug}
                      fileUrl={item.fileUrl || '#'}
                      fileType={item.fileType || 'PDF'}
                      fileSize={item.fileSize || 0}
                      tags={item.tags}
                      createdAt={item.createdAt}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                  No matching academic doubts found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Try broadening your search terms, removing active subject filters, or exploring our subject taxonomies.
                </p>
                <div className="pt-2">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-between border-t border-slate-200/80 dark:border-white/[0.06] text-xs font-mono">
                {page > 1 ? (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}${
                      subjectSlug ? `&subject=${subjectSlug}` : ''
                    }`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Link>
                ) : (
                  <div />
                )}

                <span className="text-slate-400">
                  {page} / {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}${
                      subjectSlug ? `&subject=${subjectSlug}` : ''
                    }`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
