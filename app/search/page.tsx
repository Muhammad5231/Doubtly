import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { searchContent } from '@/lib/search/rank';
import { SearchBox } from '@/components/SearchBox';
import { QuestionCard } from '@/components/QuestionCard';
import { NoteCard } from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  Layers,
  Calculator,
  Atom,
  FlaskConical,
  Binary,
  Dna,
  GraduationCap,
} from 'lucide-react';

// Thin content: enforce noindex per prompt requirements
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
    type?: 'all' | 'questions' | 'notes';
    sort?: 'relevance' | 'newest' | 'views';
    page?: string;
  };
}

function getSubjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
    return <Calculator className="w-3.5 h-3.5" />;
  }
  if (lower.includes('physic')) {
    return <Atom className="w-3.5 h-3.5" />;
  }
  if (lower.includes('chem')) {
    return <FlaskConical className="w-3.5 h-3.5" />;
  }
  if (lower.includes('comput') || lower.includes('code') || lower.includes('program')) {
    return <Binary className="w-3.5 h-3.5" />;
  }
  if (lower.includes('bio')) {
    return <Dna className="w-3.5 h-3.5" />;
  }
  return <GraduationCap className="w-3.5 h-3.5" />;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const subjectSlug = searchParams.subject;
  const type = searchParams.type || 'all';
  const sort = searchParams.sort || 'relevance';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const limit = 10;

  const [searchResults, subjects, totalQuestionCount, totalNoteCount] = await Promise.all([
    searchContent({
      query,
      subjectSlug,
      type,
      sort,
      page,
      limit,
    }),
    db.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
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

  const { items, total, totalPages } = searchResults;
  const hasActiveFilters = Boolean(query || subjectSlug || type !== 'all' || sort !== 'relevance');

  // Helper to build filter query string
  const createFilterUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (subjectSlug) params.set('subject', subjectSlug);
    if (type !== 'all') params.set('type', type);
    if (sort !== 'relevance') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    return `/search?${params.toString()}`;
  };

  const currentSubject = subjects.find((s) => s.slug === subjectSlug);

  return (
    <div className="min-h-screen pb-16">
      {/* Top Search Command Header */}
      <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-primary-50/40 via-background to-background dark:from-surface-darkCard/25">
        <div className="absolute inset-0 bg-grid-slate pointer-events-none opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="max-w-3xl mx-auto mb-6">
            <SearchBox initialValue={query} large autoFocus={!query} />
          </div>

          {/* Quick Active Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href={createFilterUrl({ type: 'all', page: '1' })}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                type === 'all'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary-400'
              }`}
            >
              All Content ({totalQuestionCount + totalNoteCount})
            </Link>

            <Link
              href={createFilterUrl({ type: 'questions', page: '1' })}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                type === 'questions'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary-400'
              }`}
            >
              Questions & Solutions ({totalQuestionCount})
            </Link>

            <Link
              href={createFilterUrl({ type: 'notes', page: '1' })}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                type === 'notes'
                  ? 'bg-secondary-600 text-white shadow-xs'
                  : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-secondary-400'
              }`}
            >
              Study Notes ({totalNoteCount})
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Filters & Results */}
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-heading font-bold text-sm text-ink dark:text-white">
                    Filter Results
                  </h3>
                </div>

                {hasActiveFilters && (
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                    title="Clear all filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Link>
                )}
              </div>

              {/* Type filter */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
                  Content Type
                </label>
                <div className="space-y-1">
                  {[
                    { label: 'All Content', value: 'all', count: totalQuestionCount + totalNoteCount },
                    { label: 'Questions & Solutions', value: 'questions', count: totalQuestionCount },
                    { label: 'Notes & PDFs', value: 'notes', count: totalNoteCount },
                  ].map((item) => {
                    const isSelected = type === item.value;
                    return (
                      <Link
                        key={item.value}
                        href={createFilterUrl({ type: item.value, page: '1' })}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/60 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-primary-200/60 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {item.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Subject filter */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
                  Academic Subject
                </label>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  <Link
                    href={createFilterUrl({ subject: undefined, page: '1' })}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                      !subjectSlug
                        ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/60 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>All Subjects</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {totalQuestionCount + totalNoteCount}
                    </span>
                  </Link>

                  {subjects.map((sub) => {
                    const isSelected = subjectSlug === sub.slug;
                    const subTotal = sub._count.questions + sub._count.notes;
                    return (
                      <Link
                        key={sub.id}
                        href={createFilterUrl({ subject: sub.slug, page: '1' })}
                        className={`flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/60 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}>
                            {getSubjectIcon(sub.name)}
                          </span>
                          <span className="truncate">{sub.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-primary-200/60 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {subTotal}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Sort order */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
                  Sort Order
                </label>
                <div className="space-y-1">
                  {[
                    { label: 'Relevance (Blended)', value: 'relevance' },
                    { label: 'Newest Added', value: 'newest' },
                    { label: 'Most Viewed', value: 'views' },
                  ].map((item) => {
                    const isSelected = sort === item.value;
                    return (
                      <Link
                        key={item.value}
                        href={createFilterUrl({ sort: item.value, page: '1' })}
                        className={`flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/60 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

        {/* Main Search Results Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Header summary */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-ink dark:text-white">
                {query ? (
                  <>
                    Results for &ldquo;<span className="text-primary-600">{query}</span>&rdquo;
                  </>
                ) : (
                  'Browse All Doubts & Notes'
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Found {total.toLocaleString()} matched results {query && '(ranked by weighted relevance & trigram similarity)'}
              </p>
            </div>
          </div>

          {/* Results list */}
          {items.length === 0 ? (
            <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <Search className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-heading font-bold text-ink dark:text-white mb-2">
                No matching results found
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try checking for typos, searching broader keywords, or exploring our subject categories.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
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
                      highlightedSnippet={item.snippet}
                      subjectName={item.subjectName}
                      subjectSlug={item.subjectSlug}
                      views={item.views}
                      tags={item.tags}
                      createdAt={item.createdAt}
                    />
                  );
                } else {
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
                      fileType={item.fileType}
                      fileSize={item.fileSize}
                      tags={item.tags}
                      createdAt={item.createdAt}
                    />
                  );
                }
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={createFilterUrl({ page: String(page - 1) })}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Link>
              )}

              <span className="text-xs text-slate-500 px-3">
                Page {page} of {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={createFilterUrl({ page: String(page + 1) })}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
    </div>
  );
}

