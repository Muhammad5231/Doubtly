'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, Eye } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface SubjectOption {
  id: string;
  name: string;
}

interface QuestionFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    subjectId: string;
    body: string;
    answer: string;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED';
  };
  subjects: SubjectOption[];
}

export function QuestionForm({ initialData, subjects }: QuestionFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [subjectId, setSubjectId] = useState(
    initialData?.subjectId || subjects[0]?.id || ''
  );
  const [body, setBody] = useState(initialData?.body || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [tagsStr, setTagsStr] = useState(initialData?.tags?.join(', ') || '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    initialData?.status || 'PUBLISHED'
  );
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug || undefined,
      subjectId,
      body,
      answer,
      tags,
      status,
    };

    try {
      const url = isEditing
        ? `/api/admin/questions/${initialData?.id}`
        : '/api/admin/questions';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save question');
      }

      router.push('/admin/questions');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving question');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-heading font-bold text-ink dark:text-white">
            {isEditing ? 'Edit Question' : 'Create New Question'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? 'Update Question' : 'Publish Solution'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Question Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. How do you find the derivative of sin(x^2) using the chain rule?"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-ink dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Slug and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="auto-generated-from-title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Body (Rich Text / HTML / Markdown) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Question Context & Formula Details (HTML/Text) *
            </label>
            <span className="text-[11px] text-slate-400">
              Sanitized with DOMPurify on save
            </span>
          </div>
          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Provide context, formulas, given parameters, or problem statement..."
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Answer Solution (Rich Text / HTML / Markdown) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Step-by-Step Answer / Solution *
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('edit')}
                className={`px-2.5 py-1 rounded-lg ${
                  previewTab === 'edit'
                    ? 'bg-primary-100 text-primary-800 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                  previewTab === 'preview'
                    ? 'bg-primary-100 text-primary-800 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>

          {previewTab === 'edit' ? (
            <textarea
              required
              rows={10}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write the full solution here. HTML tags like <p>, <h3>, <ul>, <pre>, <code> are supported..."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[200px] prose-content bg-slate-50/50 dark:bg-slate-900/50">
              <div dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
          )}
        </div>

        {/* Tags & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Topic Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="calculus, chain-rule, differentiation"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="PUBLISHED">Published (Visible to students)</option>
              <option value="DRAFT">Draft (Admin eyes only)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}

