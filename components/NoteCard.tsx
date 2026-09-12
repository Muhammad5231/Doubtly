import React from 'react';
import Link from 'next/link';
import { FileText, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatBytes } from '@/lib/utils';

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
  createdAt,
}: NoteCardProps) {
  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-secondary-500/70 dark:hover:border-secondary-500/70 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Link
            href={`/subject/${subjectSlug}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 dark:bg-secondary-950/70 dark:text-secondary-300 border border-secondary-100 dark:border-secondary-900/60 hover:bg-secondary-100 dark:hover:bg-secondary-900/80 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
            {subjectName}
          </Link>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex items-start gap-3.5 mb-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <Link href={`/notes/${slug}`} className="block group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
              <h3 className="text-base sm:text-lg font-heading font-bold text-ink dark:text-slate-100 line-clamp-1 leading-snug">
                {title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="uppercase font-bold tracking-wider text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.2 rounded">
                {fileType}
              </span>
              {fileSize > 0 && <span>• {formatBytes(fileSize)}</span>}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer with view & download buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md"
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
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-secondary-50 text-secondary-700 dark:bg-secondary-950/60 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-900/80 transition-colors border border-secondary-200/60 dark:border-secondary-800/60"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
          <Link
            href={`/notes/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-secondary-600 dark:text-secondary-400 hover:underline"
          >
            <span>Read</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

