'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Tag,
  Clock,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  CornerDownLeft,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SuggestionItem {
  type: 'question' | 'tag' | 'subject' | 'history';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  snippet?: string;
  views?: number;
  tags?: string[];
  subject?: { name: string; slug: string };
  createdAt?: string;
}

interface SearchBoxProps {
  initialValue?: string;
  placeholder?: string;
  className?: string;
  large?: boolean;
  autoFocus?: boolean;
}

export function SearchBox({
  initialValue = '',
  placeholder = 'Search doubts, step-by-step solutions, formulas, notes...',
  className = '',
  large = false,
  autoFocus = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Platform detection for keyboard shortcut display
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }
  }, []);

  // Global keyboard shortcut to focus search (/ or Ctrl+K / Cmd+K)
  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (
        (event.key === '/' && !isInput) ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Sync initialValue
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside to dismiss
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast 150ms Debounced Suggestion Fetch with in-flight cancellation
  const fetchSuggestions = useCallback((searchStr: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = searchStr.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Suggest API failed');
        const data = await res.json();

        const combined: SuggestionItem[] = [];

        // 1. Questions with rich preview data
        if (Array.isArray(data.questions)) {
          data.questions.forEach((q: any) => {
            combined.push({
              type: 'question',
              id: `q-${q.id}`,
              title: q.title,
              subtitle: q.subject?.name,
              url: `/q/${q.slug}`,
              snippet: q.snippet,
              views: q.views,
              tags: q.tags,
              subject: q.subject,
              createdAt: q.createdAt,
            });
          });
        }

        // 2. Subjects
        if (Array.isArray(data.subjects)) {
          data.subjects.forEach((s: any) => {
            combined.push({
              type: 'subject',
              id: `sub-${s.id}`,
              title: s.name,
              subtitle: 'Subject Directory',
              url: `/subject/${s.slug}`,
              snippet: `Browse comprehensive verified doubts, lecture notes, and formula sheets in ${s.name}.`,
            });
          });
        }

        // 3. Tags
        if (Array.isArray(data.tags)) {
          data.tags.forEach((tag: string) => {
            combined.push({
              type: 'tag',
              id: `tag-${tag}`,
              title: `#${tag}`,
              subtitle: 'Topic Tag',
              url: `/search?q=${encodeURIComponent(tag)}`,
              snippet: `Find all educational doubts and verified derivations tagged with #${tag}.`,
            });
          });
        }

        // 4. Recent queries
        if (Array.isArray(data.recentQueries)) {
          data.recentQueries.forEach((rq: string) => {
            combined.push({
              type: 'history',
              id: `recent-${rq}`,
              title: rq,
              subtitle: 'Popular Search',
              url: `/search?q=${encodeURIComponent(rq)}`,
              snippet: `Explore high-yield student doubts matching "${rq}".`,
            });
          });
        }

        setSuggestions(combined);
        setIsOpen(combined.length > 0);
        setActiveIndex(0);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Suggest error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 150); // 150ms debounce
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  const handleSelect = (item: SuggestionItem) => {
    setIsOpen(false);
    router.push(item.url);
  };

  const handleSearchSubmit = (overrideQuery?: string) => {
    const targetQuery = (overrideQuery ?? query).trim();
    if (!targetQuery) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(targetQuery)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const activeSuggestion = suggestions[activeIndex] ?? suggestions[0];

  return (
    <div ref={containerRef} className={cn('relative w-full z-40', className)}>
      {/* Command Bar Input Box */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'relative flex items-center transition-all duration-300 rounded-2xl group',
          'bg-white/90 dark:bg-[#0E111B]/95 backdrop-blur-2xl border',
          isFocused || isOpen
            ? 'border-indigo-500/60 ring-4 ring-indigo-500/15 shadow-glow-primary dark:shadow-[0_0_35px_-5px_rgba(99,102,241,0.25)]'
            : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] shadow-tactile',
          large ? 'h-16 px-5' : 'h-11 px-3.5'
        )}
      >
        <Search
          className={cn(
            'flex-shrink-0 transition-colors',
            isFocused || isOpen
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300',
            large ? 'w-5 h-5 mr-3.5' : 'w-4 h-4 mr-2.5'
          )}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className={cn(
            'w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-medium',
            large ? 'text-base sm:text-lg' : 'text-sm'
          )}
        />

        {loading && (
          <Loader2
            className={cn(
              'animate-spin text-indigo-500 mr-2 flex-shrink-0',
              large ? 'w-5 h-5' : 'w-4 h-4'
            )}
          />
        )}

        {/* ⌘K Command Indicator Badge */}
        {!query && !loading && (
          <div className="hidden sm:flex items-center gap-1 mr-1 flex-shrink-0 pointer-events-none select-none">
            <kbd className="px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-md shadow-xs">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </div>
        )}

        {query && !loading && (
          <button
            type="button"
            onClick={clearQuery}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1.5 focus:outline-none transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {large && (
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95"
          >
            Search
            <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
          </button>
        )}
      </div>

      {/* Split-View Autosuggest Command Palette Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 left-0 right-0 top-full mt-3 bg-white/95 dark:bg-[#0D0F17]/95 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl shadow-slate-900/10 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Top Quick Action Bar */}
          <div
            onClick={() => handleSearchSubmit()}
            className="px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/[0.04] border-b border-slate-100 dark:border-white/[0.06] hover:bg-indigo-500/[0.08] cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              Press Enter for full database search matching &ldquo;{query}&rdquo;
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] opacity-80">
              ↵ Enter
            </span>
          </div>

          {/* Split Pane: Left (Matches) & Right (Live Solution Preview) */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-white/[0.06]">
            {/* Left Pane: Items List (Col 7) */}
            <div className="md:col-span-7 max-h-[60vh] overflow-y-auto py-2 divide-y divide-slate-100 dark:divide-white/[0.03]">
              {suggestions.map((item, idx) => {
                const isActive = idx === activeIndex;

                let Icon = Search;
                if (item.type === 'subject') Icon = BookOpen;
                if (item.type === 'tag') Icon = Tag;
                if (item.type === 'history') Icon = Clock;

                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      'px-4 py-3 flex items-center justify-between cursor-pointer transition-colors select-none group',
                      isActive
                        ? 'bg-indigo-500/[0.08] dark:bg-white/[0.06] text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
                          item.type === 'question' &&
                            'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60',
                          item.type === 'subject' &&
                            'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60',
                          item.type === 'tag' &&
                            'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60',
                          item.type === 'history' &&
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-snug">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isActive && (
                        <span className="hidden sm:inline-flex text-[10px] font-mono uppercase tracking-wider text-indigo-500 font-semibold">
                          View &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Pane: Live Solution Preview (Col 5) */}
            <div className="hidden md:flex md:col-span-5 p-5 bg-slate-50/50 dark:bg-[#0B0D14]/70 flex-col justify-between min-h-[320px]">
              {activeSuggestion ? (
                <div className="space-y-4">
                  {/* Subject Badge & Verified Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      {activeSuggestion.subject?.name || activeSuggestion.subtitle || 'Verified Solution'}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 dark:text-amber-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                      Verified
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white line-clamp-3 leading-snug">
                    {activeSuggestion.title}
                  </h4>

                  {/* Snippet / Formula Preview */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    <p className="line-clamp-4">
                      {activeSuggestion.snippet ||
                        'Verified step-by-step academic explanation, formula derivation, and high-yield notes.'}
                    </p>
                  </div>

                  {/* Tags */}
                  {activeSuggestion.tags && activeSuggestion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeSuggestion.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-200/70 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                  <BookOpen className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs">Hover over an item to preview solution</p>
                </div>
              )}

              {/* Bottom Quick-Launch Trigger */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono">Use ↑ / ↓ to navigate</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  Open Solution ↵
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
