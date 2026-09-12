'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, ThumbsUp, Calendar, ChevronRight, CheckCircle2, ChevronDown, Sparkles, BookOpen, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { StemRenderer } from '@/components/StemRenderer';

export interface QuestionCardProps {
  id: string;
  title: string;
  slug: string;
  snippet?: string;
  subjectName: string;
  subjectSlug: string;
  views: number;
  helpfulVotes?: number;
  tags?: string[];
  createdAt: string;
  highlightedSnippet?: string;
}

export function QuestionCard({
  title,
  slug,
  snippet,
  subjectName,
  subjectSlug,
  views,
  helpfulVotes,
  tags = [],
  createdAt,
  highlightedSnippet,
}: QuestionCardProps) {
  const [isPeekOpen, setIsPeekOpen] = useState(false);

  // Calculate estimated read time (avg 180 words/min)
  const wordCount = (snippet || title).split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 40));

  return (
    <article
      className={cn(
        'group relative rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden',
        'bg-white/90 dark:bg-[#0D0F17]/90 backdrop-blur-xl border',
        'border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/40 dark:hover:border-indigo-500/50',
        'shadow-tactile hover:shadow-glow-subtle'
      )}
    >
      {/* Ambient Top Subtle Glow Strip on Hover */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 sm:p-6">
        {/* Monospaced Metadata Strip at Top */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-white/[0.05] text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Link
              href={`/subject/${subjectSlug}`}
              className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {subjectName}
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime}m read
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views.toLocaleString()} views
            </span>
            <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-amber-500" />
              Verified
            </span>
          </div>
        </div>

        {/* Question Title */}
        <Link
          href={`/q/${slug}`}
          className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
        >
          <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-slate-100 line-clamp-2 tracking-tight leading-snug">
            {title}
          </h3>
        </Link>

        {/* 2-line problem statement summary */}
        <div className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {highlightedSnippet ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedSnippet }} />
          ) : snippet && (snippet.includes('$') || snippet.includes('\\')) ? (
            <StemRenderer content={snippet.slice(0, 180)} compact />
          ) : (
            <p>{snippet || 'Step-by-step verified academic solution with core formula derivation.'}</p>
          )}
        </div>

        {/* Solution Preview Peek Drawer (Accordion) */}
        {isPeekOpen && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-indigo-500/[0.04] dark:bg-white/[0.03] border border-indigo-500/20 dark:border-white/[0.08] text-xs space-y-2 animate-in fade-in-50 slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Step 1 & Core Formula Peek
              </span>
              <span className="text-slate-400">Preview</span>
            </div>
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <StemRenderer
                content={
                  snippet
                    ? snippet.slice(0, 200) + '...'
                    : 'Identify known variables, formulate boundary constraints, and apply standard derivation rule.'
                }
                compact
              />
            </div>
            <div className="pt-1 flex justify-end">
              <Link
                href={`/q/${slug}`}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Open Full Derivation &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer Strip: Tags, Accordion Trigger, and Link */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Quick Solution Peek Toggle */}
          <button
            type="button"
            onClick={() => setIsPeekOpen(!isPeekOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition-colors"
          >
            <span>{isPeekOpen ? 'Hide Peek' : 'Peek Formula'}</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', isPeekOpen && 'rotate-180')} />
          </button>

          {/* Tags in monospaced format */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-hidden">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/[0.05] px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/q/${slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors group/link"
        >
          <span>Full Solution</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
