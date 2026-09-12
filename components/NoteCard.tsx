'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Download, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface NoteCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  subjectName: string;
  subjectSlug: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  tags?: string[];
  createdAt: string;
}

export function NoteCard({
  title,
  slug,
  description,
  subjectName,
  subjectSlug,
  fileUrl,
  fileType = 'pdf',
  fileSize = 0,
  tags = [],
}: NoteCardProps) {
  return (
    <article
      className={cn(
        'group relative rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden',
        'bg-white/90 dark:bg-[#0D0F17]/90 backdrop-blur-xl border',
        'border-slate-200/80 dark:border-white/[0.08] hover:border-cyan-500/40 dark:hover:border-cyan-500/50',
        'shadow-tactile hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]'
      )}
    >
      <div className="p-5 sm:p-6">
        {/* Monospaced Top Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-white/[0.05] text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Link
              href={`/subject/${subjectSlug}`}
              className="inline-flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 uppercase tracking-wider transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              {subjectName}
            </Link>
            <span>•</span>
            <span className="uppercase font-bold text-amber-500 dark:text-amber-400">
              {fileType}
            </span>
            {fileSize > 0 && <span>({formatBytes(fileSize)})</span>}
          </div>

          <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-amber-500" />
            High-Yield
          </span>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-3.5 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/notes/${slug}`}
              className="block group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
                {title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer Strip */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/[0.05] px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-all border border-cyan-500/20"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
          <Link
            href={`/notes/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors"
          >
            <span>Read</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
