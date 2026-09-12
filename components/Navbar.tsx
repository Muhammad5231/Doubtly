'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchBox } from '@/components/SearchBox';
import { BookOpen, FileText, Video, TrendingUp, Menu, X, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't render public navbar on admin pages
  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  const navLinks = [
    { name: 'Questions', href: '/search?type=questions', icon: BookOpen },
    { name: 'Notes & PDFs', href: '/notes', icon: FileText },
    { name: 'Video Lectures', href: '/videos', icon: Video },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
  ];

  const showHeaderSearch = pathname !== '/' && !pathname.startsWith('/search');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-surface-dark/85 backdrop-blur-md transition-colors shadow-xs">
      {/* Brand accent gradient bar */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-primary-600 via-secondary-500 to-spark" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Logo size="md" />
        </div>

        {/* Header Search Box (Visible when not on homepage) */}
        {showHeaderSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 animate-in fade-in-50 duration-200">
            <SearchBox placeholder="Search doubts, solutions, notes..." />
          </div>
        )}

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 font-semibold shadow-xs border border-primary-100/80 dark:border-primary-900/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-ink dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400')} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Theme Toggle & Mobile Menu) */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Admin portal shortcut for educators/admins */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Admin Portal"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-primary-500" />
            <span>Admin</span>
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors border border-slate-200/60 dark:border-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark px-4 pt-2 pb-6 space-y-3">
          <div className="pt-2 pb-1">
            <SearchBox
              placeholder="Search doubts, notes..."
              autoFocus
              className="w-full"
            />
          </div>

          <div className="grid gap-1 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

