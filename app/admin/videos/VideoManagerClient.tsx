'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Video, Plus, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { AdminDeleteButton } from '../questions/DeleteButton';

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  subjectId: string;
  subjectName: string;
  status: string;
  createdAt: string;
}

interface VideoManagerClientProps {
  initialVideos: VideoItem[];
  subjects: Array<{ id: string; name: string }>;
}

export function VideoManagerClient({
  initialVideos,
  subjects,
}: VideoManagerClientProps) {
  const router = useRouter();

  // New video modal form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          youtubeId,
          description,
          subjectId,
          status: 'PUBLISHED',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add video');
      }

      // Reset form
      setTitle('');
      setYoutubeId('');
      setDescription('');
      setShowAddForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Add YouTube Video'}
        </button>
      </div>

      {/* Add Video Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddVideo}
          className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-md animate-in fade-in-50"
        >
          <h2 className="text-lg font-heading font-bold text-ink dark:text-white">
            Embed YouTube Lecture
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus: Chain Rule Explained Simply"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                YouTube URL or 11-char ID *
              </label>
              <input
                type="text"
                required
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or ID"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Subject *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short video overview"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Save Video
            </button>
          </div>
        </form>
      )}

      {/* Videos List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video w-full bg-slate-900">
                <Image
                  src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="default" className="text-[10px]">
                    {video.subjectName}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {video.youtubeId}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2">
              <span className="text-xs text-slate-400">
                {formatDate(video.createdAt)}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Open on YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <AdminDeleteButton
                  endpoint={`/api/admin/videos/${video.id}`}
                  itemTitle={video.title}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

