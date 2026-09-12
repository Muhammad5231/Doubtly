'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export interface VideoCardProps {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
  subjectName: string;
  subjectSlug: string;
  createdAt: string;
}

export function VideoCard({
  title,
  youtubeId,
  description,
  subjectName,
  subjectSlug,
  createdAt,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <article
      className={cn(
        'group relative rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden',
        'bg-white/90 dark:bg-[#0D0F17]/90 backdrop-blur-xl border',
        'border-slate-200/80 dark:border-white/[0.08] hover:border-amber-500/40 dark:hover:border-amber-500/50',
        'shadow-tactile hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)]'
      )}
    >
      {/* Video Facade / Iframe */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full group/btn focus:outline-none cursor-pointer"
            aria-label={`Play video lesson: ${title}`}
          >
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover group-hover/btn:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

            {/* Glowing Play Trigger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/90 group-hover/btn:bg-amber-400 group-hover/btn:scale-110 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/60 transition-all duration-200">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Facade Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Lecture
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Content Meta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Monospaced Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/[0.05] text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <Link
              href={`/subject/${subjectSlug}`}
              className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 uppercase tracking-wider transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {subjectName}
            </Link>

            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(createdAt)}
            </span>
          </div>

          <h3 className="font-heading font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {title}
          </h3>

          {description && (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
