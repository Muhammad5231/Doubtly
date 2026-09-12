'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Calculator,
  Atom,
  FlaskConical,
  Binary,
  Dna,
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Video,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
  noteCount: number;
}

interface SearchFacetBarProps {
  subjects: SubjectItem[];
  totalResults: number;
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

export function SearchFacetBar({ subjects, totalResults }: SearchFacetBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const query = searchParams.get('q') || '';
  const currentSubject = searchParams.get('subject') || '';
  const currentFormat = searchParams.get('format') || 'all';
  const hasMath = searchParams.get('hasMath') === 'true';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const difficulty = searchParams.get('difficulty') || 'all';
  const sort = searchParams.get('sort') || 'relevance';

  const updateFilters = (newParams: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Reset to page 1 on filter change

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };

  const activeFilterCount =
    (currentSubject ? 1 : 0) +
    (currentFormat !== 'all' ? 1 : 0) +
    (hasMath ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (difficulty !== 'all' ? 1 : 0) +
    (sort !== 'relevance' ? 1 : 0);

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Filter Results
          </h3>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
          Sort By
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Relevance', value: 'relevance' },
            { label: 'Most Helpful', value: 'helpful' },
            { label: 'Newest', value: 'newest' },
            { label: 'Most Viewed', value: 'views' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => updateFilters({ sort: item.value })}
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-all border',
                sort === item.value
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 font-semibold shadow-xs'
                  : 'bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Multi-Select Pills */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Subjects
          </label>
          {currentSubject && (
            <button
              type="button"
              onClick={() => updateFilters({ subject: null })}
              className="text-[10px] font-mono text-slate-400 hover:text-indigo-500"
            >
              All Subjects
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {subjects.map((sub) => {
            const isSelected = currentSubject === sub.slug;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => updateFilters({ subject: isSelected ? null : sub.slug })}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all border text-left',
                  isSelected
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/40 font-semibold shadow-sm'
                    : 'bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={isSelected ? 'text-indigo-500' : 'text-slate-400'}>
                    {getSubjectIcon(sub.name)}
                  </span>
                  <span className="truncate">{sub.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 ml-2">
                  {sub.questionCount + sub.noteCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Format Filter */}
      <div>
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
          Content Format
        </label>
        <div className="space-y-2">
          {/* Step by Step Math */}
          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition-colors">
            <input
              type="checkbox"
              checked={hasMath}
              onChange={(e) => updateFilters({ hasMath: e.target.checked ? 'true' : null })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              With Step-by-Step Math
            </span>
          </label>

          {/* Downloadable Notes */}
          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition-colors">
            <input
              type="checkbox"
              checked={currentFormat === 'notes'}
              onChange={(e) => updateFilters({ format: e.target.checked ? 'notes' : 'all' })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-transparent"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Downloadable PDF Notes
            </span>
          </label>
        </div>
      </div>

      {/* Verification Level Toggle */}
      <div>
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
          Verification Level
        </label>
        <button
          type="button"
          onClick={() => updateFilters({ verified: verifiedOnly ? null : 'true' })}
          className={cn(
            'w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs',
            verifiedOnly
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold shadow-xs'
              : 'bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300'
          )}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Verified Solutions Only
          </span>
          <span
            className={cn(
              'w-8 h-4 rounded-full transition-colors relative flex items-center',
              verifiedOnly ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            )}
          >
            <span
              className={cn(
                'w-3 h-3 rounded-full bg-white transition-transform transform shadow-xs',
                verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </span>
        </button>
      </div>

      {/* Difficulty Scale */}
      <div>
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
          Difficulty Scale
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                updateFilters({ difficulty: difficulty === item.value ? null : item.value })
              }
              className={cn(
                'px-2 py-1.5 text-[11px] font-mono rounded-lg transition-all border text-center',
                difficulty === item.value
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40 font-bold shadow-xs'
                  : 'bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden mb-4 flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>Faceted Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-mono">
              {activeFilterCount}
            </span>
          )}
        </button>

        <span className="text-xs font-mono text-slate-400">
          {totalResults} results
        </span>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-24 bg-white/90 dark:bg-[#0D0F17]/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-tactile">
        {filterContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-[#090A0F] border-l border-slate-200 dark:border-white/[0.08] p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <span className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm"
              >
                View Results ({totalResults})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

