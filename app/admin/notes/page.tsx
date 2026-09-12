import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, Search, FileText, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatBytes } from '@/lib/utils';
import { AdminDeleteButton } from '../questions/DeleteButton';

export const dynamic = 'force-dynamic';

interface AdminNotesPageProps {
  searchParams: { search?: string; page?: string };
}

export default async function AdminNotesPage({
  searchParams,
}: AdminNotesPageProps) {
  const search = searchParams.search || '';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const limit = 15;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [notes, total] = await Promise.all([
    db.note.findMany({
      where: whereClause,
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.note.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink dark:text-white">
            Study Notes & PDFs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {total} PDF guides, formula summaries, and chapter notes
          </p>
        </div>

        <Link
          href="/admin/notes/new"
          className="inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Upload New Note
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <form method="GET" className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search notes by title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </form>
      </div>

      {/* Notes Table */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Format & Size</th>
                <th className="px-6 py-3.5">Uploaded</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {notes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No notes uploaded yet.
                  </td>
                </tr>
              ) : (
                notes.map((note) => (
                  <tr
                    key={note.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {note.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {note.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-[11px]">
                        {note.subject.name}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      <span className="uppercase font-bold text-red-600 dark:text-red-400">
                        {note.fileType}
                      </span>{' '}
                      • {formatBytes(note.fileSize)}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(note.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/notes/${note.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-secondary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View public page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 rounded-lg text-slate-400 hover:text-secondary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <AdminDeleteButton
                          endpoint={`/api/admin/notes/${note.id}`}
                          itemTitle={note.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

