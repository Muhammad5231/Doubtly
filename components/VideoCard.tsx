'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

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

  // High quality thumbnail URL from YouTube CDN
  const thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <div className="group bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-xs hover:shadow-md hover:border-primary-400/80 dark:hover:border-primary-600/70 transition-all duration-200 flex flex-col justify-between">
      {/* Video / Facade Container */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
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
            aria-label={`Play video: ${title}`}
          >
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover group-hover/btn:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {/* Play Button Icon with glowing pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-600/90 group-hover/btn:bg-red-600 group-hover/btn:scale-110 text-white flex items-center justify-center shadow-lg shadow-red-950/50 transition-all duration-200">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>

            {/* Badge overlay on thumbnail */}
            <div className="absolute top-3 left-3">
              <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Video Lesson
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Content Meta */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <Link
              href={`/subject/${subjectSlug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/70 dark:text-primary-300 border border-primary-100 dark:border-primary-900/60 hover:bg-primary-100 dark:hover:bg-primary-900/80 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              {subjectName}
            </Link>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(createdAt)}
            </span>
          </div>

          <h3 className="font-heading font-bold text-ink dark:text-slate-100 text-base line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
            {title}
          </h3>

          {description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

