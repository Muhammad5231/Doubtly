import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getCanonicalUrl,
  truncate,
  generateNoteJsonLd,
  SITE_NAME,
} from '@/lib/seo';
import { formatDate, formatBytes } from '@/lib/utils';
import {
  ChevronRight,
  Download,
  Calendar,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const revalidate = 300; // 5-minute ISR

export async function generateStaticParams() {
  try {
    const notes = await db.note.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    return notes.map((n) => ({ slug: n.slug }));
  } catch {
    return [];
  }
}

interface NoteDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: NoteDetailPageProps): Promise<Metadata> {
  const note = await db.note.findUnique({
    where: { slug: params.slug },
    include: { subject: true },
  });

  if (!note || note.status !== 'PUBLISHED') {
    return { title: 'Note Not Found' };
  }

  const title = `${note.title} (PDF Study Notes)`;
  const description = truncate(note.description, 155);
  const canonicalUrl = getCanonicalUrl(`/notes/${note.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: SITE_NAME,
      publishedTime: note.createdAt.toISOString(),
      modifiedTime: note.updatedAt.toISOString(),
      section: note.subject.name,
      tags: note.tags,
    },
  };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const note = await db.note.findUnique({
    where: { slug: params.slug },
    include: { subject: true },
  });

  if (!note || note.status !== 'PUBLISHED') {
    notFound();
  }

  const canonicalUrl = getCanonicalUrl(`/notes/${note.slug}`);
  const jsonLd = generateNoteJsonLd({
    title: note.title,
    description: note.description,
    datePublished: note.createdAt.toISOString(),
    url: canonicalUrl,
    fileUrl: note.fileUrl,
  });

  // Google Docs PDF Viewer embed URL for cross-browser fallback
  const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    note.fileUrl
  )}&embedded=true`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/notes" className="hover:text-primary-600 transition-colors">
            Notes
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/subject/${note.subject.slug}`}
            className="hover:text-primary-600 transition-colors"
          >
            {note.subject.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">
            {note.title}
          </span>
        </nav>

        {/* Note Header */}
        <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/subject/${note.subject.slug}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 dark:bg-secondary-950/70 dark:text-secondary-300 border border-secondary-100 dark:border-secondary-900/60 hover:bg-secondary-100 dark:hover:bg-secondary-900/80 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                  {note.subject.name}
                </Link>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(note.createdAt)}
                </span>
                {note.fileSize > 0 && (
                  <>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatBytes(note.fileSize)}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-ink dark:text-white tracking-tight">
                {note.title}
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {note.description}
              </p>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Download Button */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                title="Open raw file in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Inline PDF Viewer */}
        <section className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <FileText className="w-4 h-4 text-secondary-500" />
              <span>Interactive PDF Preview</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Safe Document</span>
            </div>
          </div>

          <div className="w-full h-[75vh] bg-slate-100 dark:bg-slate-950">
            <iframe
              src={pdfViewerUrl}
              title={note.title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </>
  );
}

