import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showWordmark = true, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group transition-opacity hover:opacity-95 ${className}`}
      aria-label="Doubtly Home"
    >
      {/* Speech bubble icon with amber question dot */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-105"
        >
          <defs>
            <linearGradient id="doubtlyBubbleGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          {/* Rounded speech bubble path with tail */}
          <path
            d="M38 20C38 28.8366 30.8366 36 22 36C18.6667 36 15.5847 34.9789 13.0298 33.2289L6 37L7.77109 29.9702C5.43328 27.1852 4 23.6841 4 20C4 11.1634 11.1634 4 22 4C32.8366 4 38 11.1634 38 20Z"
            fill="url(#doubtlyBubbleGrad)"
          />
          {/* Question mark upper hook (white) */}
          <path
            d="M18.5 16.2C18.7 13.7 20.2 12.2 22.2 12.2C24.4 12.2 25.8 13.5 25.8 15.3C25.8 17.1 24.6 18.2 23.3 19.3C22.2 20.3 21.6 21.2 21.6 22.8H22.8"
            stroke="#FFFFFF"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Amber dot (#FBBF24) */}
          <circle cx="22.2" cy="27.8" r="1.8" fill="#FBBF24" />
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`font-heading font-bold tracking-tight select-none ${textSizes[size]}`}
        >
          <span className="text-slate-800 dark:text-slate-100">Doubt</span>
          <span className="text-primary-500">ly</span>
        </span>
      )}
    </Link>
  );
}

