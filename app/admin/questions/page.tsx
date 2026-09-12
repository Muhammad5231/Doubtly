import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, Search, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { AdminDeleteButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

interface AdminQuestionsPageProps {
  searchParams: {
    search?: string;
    status?: string;
    page?: string;
  };
}

export default async function AdminQuestionsPage({
  searchParams,
}: AdminQuestionsPageProps) {
  const search = searchParams.search || '';
  const status = searchParams.status || '';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const limit = 15;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status === 'DRAFT' || status === 'PUBLISHED') {
    whereClause.status = status;
  }

  const [questions, total] = await Promise.all([
    db.question.findMany({
      where: whereClause,
      include: {
        subject: true,
        _count: { select: { helpfulVotes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.question.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink dark:text-white">
            Questions & Solutions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {total} total educational doubts and solutions indexed
          </p>
        </div>

        <Link
          href="/admin/questions/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Question
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search questions by title or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </form>

        <div className="flex items-center gap-2">
          {['', 'PUBLISHED', 'DRAFT'].map((st) => (
            <Link
              key={st}
              href={`/admin/questions?status=${st}${search ? `&search=${search}` : ''}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                status === st
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All' : st}
            </Link>
          ))}
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Title & Subject</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Views</th>
                <th className="px-6 py-3.5">Helpful</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No questions found matching criteria.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {q.subject.name}
                        </Badge>
                      </div>
                      <Link
                        href={`/admin/questions/${q.id}/edit`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 line-clamp-1"
                      >
                        {q.title}
                      </Link>
                      <span className="text-xs text-slate-400 font-mono">
                        /{q.slug}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={q.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className="text-[11px]"
                      >
                        {q.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {q.views.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {q._count.helpfulVotes}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(q.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/q/${q.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View public page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <AdminDeleteButton
                          endpoint={`/api/admin/questions/${q.id}`}
                          itemTitle={q.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/questions?page=${page - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/questions?page=${page + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

