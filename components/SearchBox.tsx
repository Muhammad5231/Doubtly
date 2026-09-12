'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Tag, Clock, ArrowRight, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionItem {
  type: 'question' | 'tag' | 'subject' | 'history';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
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
  placeholder = 'Search doubts, questions, formulas, or topics...',
  className = '',
  large = false,
  autoFocus = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }
  }, []);

  // Global keyboard shortcut to focus search (/ or Ctrl+K / Cmd+K)
  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      // Don't intercept if user is typing in another input, textarea, or contentEditable
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((event.key === '/' && !isInput) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Sync initialValue if props change
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with 180ms debounce & AbortController
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

        // 1. Questions
        if (Array.isArray(data.questions)) {
          data.questions.forEach((q: any) => {
            combined.push({
              type: 'question',
              id: `q-${q.id}`,
              title: q.title,
              subtitle: q.subject?.name,
              url: `/q/${q.slug}`,
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
              subtitle: 'Subject',
              url: `/subject/${s.slug}`,
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
              subtitle: 'Topic tag',
              url: `/search?q=${encodeURIComponent(tag)}`,
            });
          });
        }

        // 4. Recent search queries
        if (Array.isArray(data.recentQueries)) {
          data.recentQueries.forEach((rq: string) => {
            combined.push({
              type: 'history',
              id: `recent-${rq}`,
              title: rq,
              subtitle: 'Popular search',
              url: `/search?q=${encodeURIComponent(rq)}`,
            });
          });
        }

        setSuggestions(combined);
        setIsOpen(combined.length > 0);
        setActiveIndex(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Suggest request error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 180); // 180ms debounce
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  const handleSelect = (item: SuggestionItem) => {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(item.url);
  };

  const handleSearchSubmit = (overrideQuery?: string) => {
    const targetQuery = (overrideQuery ?? query).trim();
    if (!targetQuery) return;
    setIsOpen(false);
    setActiveIndex(-1);
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
      setActiveIndex(-1);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input Container */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="doubtly-search-listbox"
        className={cn(
          'relative flex items-center transition-all bg-white dark:bg-surface-darkCard rounded-2xl border shadow-sm group',
          large
            ? 'h-14 sm:h-16 px-4 sm:px-5 border-slate-200 dark:border-slate-800 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15 shadow-md hover:shadow-lg'
            : 'h-11 px-3.5 border-slate-200 dark:border-slate-800 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
        )}
      >
        <Search
          className={cn(
            'flex-shrink-0 text-slate-400 group-focus-within:text-primary-500 transition-colors',
            large ? 'w-6 h-6 mr-3' : 'w-4 h-4 mr-2.5'
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
          onBlur={() => {
            setIsFocused(false);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
          className={cn(
            'w-full bg-transparent text-ink dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium',
            large ? 'text-base sm:text-lg' : 'text-sm'
          )}
        />

        {loading && (
          <Loader2
            className={cn(
              'animate-spin text-slate-400 mr-2 flex-shrink-0',
              large ? 'w-5 h-5' : 'w-4 h-4'
            )}
          />
        )}

        {/* Keyboard shortcut hint badge when empty & idle */}
        {!query && !loading && !isFocused && (
          <div className="hidden sm:flex items-center gap-1 mr-2 flex-shrink-0 pointer-events-none select-none">
            <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
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
            className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown Listbox */}
      {isOpen && (
        <div
          id="doubtly-search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 left-0 right-0 top-full mt-2 bg-white/95 dark:bg-surface-darkCard/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden animate-in fade-in-50 duration-150"
        >
          <div className="py-2 max-h-[70vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* View full search results link at top */}
            <div
              onClick={() => handleSearchSubmit()}
              className="px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 cursor-pointer transition-colors"
            >
              <span>Search for &ldquo;{query}&rdquo;</span>
              <span className="flex items-center gap-1">Press Enter <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>

            {/* Suggestions list */}
            <div>
              {suggestions.map((item, idx) => {
                const isActive = idx === activeIndex;

                let Icon = Search;
                if (item.type === 'subject') Icon = BookOpen;
                if (item.type === 'tag') Icon = Tag;
                if (item.type === 'history') Icon = Clock;

                return (
                  <div
                    key={item.id}
                    id={`suggestion-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      'px-4 py-3 flex items-center justify-between cursor-pointer transition-colors select-none',
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-ink dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                          item.type === 'question' && 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400',
                          item.type === 'subject' && 'bg-secondary-50 dark:bg-secondary-950 text-secondary-600 dark:text-secondary-400',
                          item.type === 'tag' && 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
                          item.type === 'history' && 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 capitalize hidden sm:inline-block">
                      {item.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

