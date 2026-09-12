'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, AlertCircle, Eye, Sparkles, Globe, CheckCircle2, RefreshCw } from 'lucide-react';
import { generateSeoSlug, generateMetaDescription } from '@/lib/seo';
import { StemRenderer } from '@/components/StemRenderer';

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

  const currentSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  const autoMetaDescription = useMemo(
    () => generateMetaDescription(title, answer),
    [title, answer]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(generateSeoSlug(val, currentSubject?.name));
    }
  };

  const handleRegenerateSlug = () => {
    setSlug(generateSeoSlug(title, currentSubject?.name));
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/questions"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Academic Question' : 'Author Solved Question'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
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
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-tactile">
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
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Slug and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                URL Slug
              </label>
              <button
                type="button"
                onClick={handleRegenerateSlug}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Auto-Generate
              </button>
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated-from-title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Problem Statement Body */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Problem Context / Given Statement
          </label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Detailed statement or context. Supports LaTeX math ($E=mc^2$) and chemistry..."
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Verified Solution (Answer) with STEM preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Verified Step-by-Step Solution *
            </label>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('edit')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === 'edit'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Write LaTeX
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  previewTab === 'preview'
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> STEM Preview
              </button>
            </div>
          </div>

          {previewTab === 'edit' ? (
            <textarea
              required
              rows={12}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write full derivation. Supports:&#10;• Inline Math: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$&#10;• Display Math: $$\int_a^b f(x)dx$$&#10;• Chemistry: $\ce{H2 + Cl2 -> 2HCl}$&#10;• Step badges: Step 1: Given parameters..."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[220px] bg-slate-50/50 dark:bg-slate-900/50">
              <StemRenderer content={answer || '*No solution written yet.*'} />
            </div>
          )}
        </div>

        {/* Topic Tags & Status */}
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PUBLISHED">Published (Visible to students)</option>
              <option value="DRAFT">Draft (Admin eyes only)</option>
            </select>
          </div>
        </div>

        {/* SEO / GEO Automation Card */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Globe className="w-3.5 h-3.5" />
            <span>SEO & Generative Engine Optimization (GEO) Preview</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="text-slate-400 font-mono">Meta Title:</span>
              <span>{title ? `${title} | Doubtly Solution` : 'Untitled Question'}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <span className="text-slate-400 font-mono flex-shrink-0">Meta Desc:</span>
              <span className="italic">{autoMetaDescription || 'Awaiting question content...'}</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px] pt-1">
              Length: {autoMetaDescription.length} / 160 chars • OpenGraph type: article • Schema: QAPage
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
