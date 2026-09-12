import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { VideoCard } from '@/components/VideoCard';
import { Video } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Video Lectures & Concepts',
  description:
    'Watch free curated educational video lectures explaining core academic concepts and difficult questions.',
};

interface VideosPageProps {
  searchParams: { subject?: string };
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const subjectSlug = searchParams.subject;

  const whereClause: any = { status: 'PUBLISHED' };
  if (subjectSlug) {
    whereClause.subject = { slug: subjectSlug };
  }

  let videos: any[] = [];
  let subjects: any[] = [];

  try {
    const [fetchedVideos, fetchedSubjects] = await Promise.all([
      db.video.findMany({
        where: whereClause,
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.subject.findMany({
        orderBy: { order: 'asc' },
      }),
    ]);
    videos = fetchedVideos;
    subjects = fetchedSubjects;
  } catch (error) {
    console.error('Database connection unavailable in VideosPage:', error);
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl min-h-screen">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
          <Video className="w-3.5 h-3.5" />
          <span>Video Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink dark:text-white tracking-tight">
          Educational Video Lectures
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
          Visual explanations and tutorials. Click any thumbnail to load and play directly.
        </p>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <Link
          href="/videos"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            !subjectSlug
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary-400'
          }`}
        >
          All Subjects
        </Link>
        {subjects.map((sub) => (
          <Link
            key={sub.id}
            href={`/videos?subject=${sub.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              subjectSlug === sub.slug
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary-400'
            }`}
          >
            {sub.name}
          </Link>
        ))}
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="bg-white dark:bg-surface-darkCard p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500">No video lessons available yet for this subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              youtubeId={video.youtubeId}
              description={video.description}
              subjectName={video.subject.name}
              subjectSlug={video.subject.slug}
              createdAt={video.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

