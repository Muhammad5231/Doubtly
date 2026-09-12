import React from 'react';
import { db } from '@/lib/db';
import { VideoManagerClient } from './VideoManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminVideosPage() {
  const [videos, subjects] = await Promise.all([
    db.video.findMany({
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.subject.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-ink dark:text-white">
          Video Lessons Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Embed YouTube video tutorials with click-to-load facade
        </p>
      </div>

      <VideoManagerClient
        initialVideos={videos.map((v) => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtubeId,
          description: v.description,
          subjectId: v.subjectId,
          subjectName: v.subject.name,
          status: v.status,
          createdAt: v.createdAt.toISOString(),
        }))}
        subjects={subjects}
      />
    </div>
  );
}

