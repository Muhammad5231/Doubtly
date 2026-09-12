import React from 'react';
import Link from 'next/link';
import { Eye, ThumbsUp, Calendar, Tag, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

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

// Helper for subject color themes
function getSubjectColors(subjectName: string) {
  const lower = subjectName.toLowerCase();
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
    return {
      dot: 'bg-indigo-500',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
      accentBar: 'border-l-indigo-500',
    };
  }
  if (lower.includes('physic')) {
    return {
      dot: 'bg-cyan-500',
      badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60',
      accentBar: 'border-l-cyan-500',
    };
  }
  if (lower.includes('chem')) {
    return {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      accentBar: 'border-l-emerald-500',
    };
  }
  if (lower.includes('comput') || lower.includes('code') || lower.includes('program')) {
    return {
      dot: 'bg-violet-500',
      badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60',
      accentBar: 'border-l-violet-500',
    };
  }
  if (lower.includes('bio')) {
    return {
      dot: 'bg-rose-500',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
      accentBar: 'border-l-rose-500',
    };
  }
  return {
    dot: 'bg-primary-500',
    badge: 'bg-primary-50 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300 border-primary-200/80 dark:border-primary-800/60',
    accentBar: 'border-l-primary-500',
  };
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
  const colors = getSubjectColors(subjectName);

  return (
    <article
      className={`group relative bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/90 p-5 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-400/80 dark:hover:border-primary-500/70 transition-all duration-200 flex flex-col justify-between border-l-4 ${colors.accentBar}`}
    >
      <div>
        {/* Header Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <Link
            href={`/subject/${subjectSlug}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${colors.badge} hover:scale-105`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {subjectName}
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {views.toLocaleString()}
            </span>
            {typeof helpfulVotes === 'number' && helpfulVotes > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800/50">
                <ThumbsUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {helpfulVotes}
              </span>
            )}
          </div>
        </div>

        {/* Question Title */}
        <Link href={`/q/${slug}`} className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <h3 className="text-lg sm:text-xl font-heading font-bold text-ink dark:text-slate-100 line-clamp-2 tracking-tight leading-snug">
            {title}
          </h3>
        </Link>

        {/* Solution Snippet */}
        <div className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {highlightedSnippet ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedSnippet }} />
          ) : (
            <p>{snippet}</p>
          )}
        </div>
      </div>

      {/* Footer Tags & Action Link */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-7">
          {tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <Link
          href={`/q/${slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all ml-auto flex-shrink-0 group/link"
        >
          <span>View Solution</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

