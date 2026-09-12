import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { NoteCard } from '@/components/NoteCard';
import { FileText, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Study Notes & Formula Sheets',
  description:
    'Download free PDF revision summaries, formula sheets, and chapter study guides written by top academic educators.',
};

interface NotesIndexPageProps {
  searchParams: { subject?: string };
}

export default async function NotesIndexPage({
  searchParams,
}: NotesIndexPageProps) {
  const subjectSlug = searchParams.subject;

  const whereClause: any = { status: 'PUBLISHED' };
  if (subjectSlug) {
    whereClause.subject = { slug: subjectSlug };
  }

  let notes: any[] = [];
  let subjects: any[] = [];

  try {
    const [fetchedNotes, fetchedSubjects] = await Promise.all([
      db.note.findMany({
        where: whereClause,
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
      }),
      db.subject.findMany({
        orderBy: { order: 'asc' },
      }),
    ]);
    notes = fetchedNotes;
    subjects = fetchedSubjects;
  } catch (error) {
    console.error('Database connection unavailable in NotesIndexPage:', error);
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl min-h-screen">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-600 dark:text-secondary-400 mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Curated Revision Notes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink dark:text-white tracking-tight">
          Study Notes & Formula Sheets
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
          High-yield PDF summaries, formula reference cheatsheets, and concept guides. Read online or download instantly with no limits.
        </p>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <Link
          href="/notes"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            !subjectSlug
              ? 'bg-secondary-600 text-white shadow-xs'
              : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-secondary-400'
          }`}
        >
          All Subjects
        </Link>
        {subjects.map((sub) => (
          <Link
            key={sub.id}
            href={`/notes?subject=${sub.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              subjectSlug === sub.slug
                ? 'bg-secondary-600 text-white shadow-xs'
                : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-secondary-400'
            }`}
          >
            {sub.name}
          </Link>
        ))}
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="bg-white dark:bg-surface-darkCard p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500">No study notes published yet for this subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              slug={note.slug}
              description={note.description}
              subjectName={note.subject.name}
              subjectSlug={note.subject.slug}
              fileUrl={note.fileUrl}
              fileType={note.fileType}
              fileSize={note.fileSize}
              tags={note.tags}
              createdAt={note.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

