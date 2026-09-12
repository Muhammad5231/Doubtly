'use client';

import React, { useState } from 'react';
import { ThumbsUp, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpfulButtonProps {
  questionId: string;
  initialCount?: number;
  className?: string;
}

export function HelpfulButton({
  questionId,
  initialCount = 0,
  className = '',
}: HelpfulButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleVote = async () => {
    if (loading) return;

    // Optimistic UI updates
    const prevCount = count;
    const prevVoted = hasVoted;
    const nextVoted = !prevVoted;
    const nextCount = nextVoted ? prevCount + 1 : Math.max(0, prevCount - 1);

    setHasVoted(nextVoted);
    setCount(nextCount);
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/questions/${questionId}/helpful`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to record vote');
      }

      setHasVoted(data.hasVoted);
      setCount(data.helpfulVotes);
      if (data.hasVoted) {
        setMessage('Thanks for your feedback!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      // Rollback optimistic change on error
      setHasVoted(prevVoted);
      setCount(prevCount);
      setMessage(err.message || 'Error recording feedback');
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('inline-flex flex-col items-start gap-1.5', className)}>
      <button
        onClick={handleVote}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all select-none shadow-sm',
          hasVoted
            ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-400 dark:border-primary-700 text-primary-700 dark:text-primary-300'
            : 'bg-white dark:bg-surface-darkCard border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        )}
        aria-label="Mark answer as helpful"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
        ) : hasVoted ? (
          <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        ) : (
          <ThumbsUp className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform hover:scale-110" />
        )}

        <span>{hasVoted ? 'Helpful' : 'Was this answer helpful?'}</span>

        <span
          className={cn(
            'px-2 py-0.5 text-xs rounded-full font-semibold',
            hasVoted
              ? 'bg-primary-200/60 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          )}
        >
          {count}
        </span>
      </button>

      {message && (
        <span className="text-xs text-primary-600 dark:text-primary-400 font-medium animate-in fade-in-50 duration-200">
          {message}
        </span>
      )}
    </div>
  );
}

