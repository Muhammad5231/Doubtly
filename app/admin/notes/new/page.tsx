'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface SubjectOption {
  id: string;
  name: string;
}

export default function NewNotePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/subjects')
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
          setSubjectId(data.subjects[0].id);
        }
      })
      .catch((err) => console.error('Failed to load subjects:', err));
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 25 * 1024 * 1024) {
        setError('File exceeds maximum size of 25MB.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        const baseName = selected.name.replace(/\.[^/.]+$/, '');
        handleTitleChange(baseName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgressStatus('Uploading PDF to cloud storage...');

    try {
      // 1. Upload file buffer to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload document');
      }

      // 2. Create Note in Postgres Database
      setProgressStatus('Saving note record and generating search vectors...');
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const noteRes = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          subjectId,
          description,
          fileUrl: uploadData.url,
          fileType: uploadData.format || 'pdf',
          fileSize: uploadData.size || file.size,
          tags,
          status: 'PUBLISHED',
        }),
      });

      const noteData = await noteRes.json();
      if (!noteRes.ok) {
        throw new Error(noteData.error || 'Failed to register note');
      }

      router.push('/admin/notes');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error occurred during note publication');
    } finally {
      setUploading(false);
      setProgressStatus(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/notes"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-heading font-bold text-ink dark:text-white">
          Upload Study Note / PDF
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* File Drop Area */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Document File (PDF up to 25MB) *
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-secondary-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,application/pdf"
              required
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary-50 dark:bg-secondary-950/60 text-secondary-600 flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {file ? file.name : 'Click to browse or drop PDF here'}
              </p>
              <p className="text-xs text-slate-400">
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                  : 'Magic-byte verified application/pdf up to 25MB'}
              </p>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Note Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Organic Chemistry Reaction Mechanisms Cheatsheet"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>

        {/* Subject & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="auto-generated-slug"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Description / Chapter Summary *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short overview of topics covered in this PDF..."
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Tags (Comma-separated)
          </label>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="cheatsheet, formulas, exam-prep"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-between">
          {progressStatus && (
            <span className="text-xs text-secondary-600 dark:text-secondary-400 font-medium animate-pulse">
              {progressStatus}
            </span>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="ml-auto inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload & Publish Note
          </button>
        </div>
      </form>
    </div>
  );
}

