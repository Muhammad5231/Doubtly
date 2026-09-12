import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  HelpCircle,
  FileText,
  Video,
  BookOpen,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    questionCount,
    noteCount,
    videoCount,
    subjectCount,
    recentQuestions,
    topSearches,
  ] = await Promise.all([
    db.question.count(),
    db.note.count(),
    db.video.count(),
    db.subject.count(),
    db.question.findMany({
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    db.searchLog.findMany({
      orderBy: { count: 'desc' },
      take: 8,
    }),
  ]);

  const stats = [
    {
      name: 'Questions & Solutions',
      count: questionCount,
      icon: HelpCircle,
      href: '/admin/questions',
      color: 'bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400',
    },
    {
      name: 'Study Notes & PDFs',
      count: noteCount,
      icon: FileText,
      href: '/admin/notes',
      color: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-950/60 dark:text-secondary-400',
    },
    {
      name: 'Video Lectures',
      count: videoCount,
      icon: Video,
      href: '/admin/videos',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      name: 'Academic Subjects',
      count: subjectCount,
      icon: BookOpen,
      href: '/admin/subjects',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink dark:text-white">
            Editorial Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage educational content, monitor search trends, and publish new solutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions/new"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Question
          </Link>
          <Link
            href="/admin/notes/new"
            className="inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload Note
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.name}
              href={s.href}
              className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-heading font-extrabold text-ink dark:text-white">
                {s.count.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                {s.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Questions Table/List */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-bold text-ink dark:text-white">
              Recent Activity
            </h2>
            <Link
              href="/admin/questions"
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentQuestions.map((q) => (
              <div
                key={q.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={q.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px]">
                      {q.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {q.subject.name}
                    </span>
                  </div>
                  <Link
                    href={`/admin/questions/${q.id}/edit`}
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 line-clamp-1"
                  >
                    {q.title}
                  </Link>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {q.views}
                  </span>
                  <span>{formatDate(q.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Searches This Week */}
        <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-spark" />
            <h2 className="text-lg font-heading font-bold text-ink dark:text-white">
              Top Student Queries
            </h2>
          </div>

          <div className="space-y-3">
            {topSearches.length === 0 ? (
              <p className="text-xs text-slate-400">No searches recorded yet.</p>
            ) : (
              topSearches.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <span className="flex items-center gap-2.5 truncate pr-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {s.query}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                    {s.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

