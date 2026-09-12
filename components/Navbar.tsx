'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchBox } from '@/components/SearchBox';
import { BookOpen, FileText, Video, TrendingUp, Menu, X, ShieldAlert, Sparkles, Mail } from 'lucide-react';
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
    { name: 'About', href: '/about', icon: Sparkles },
  ];

  const showHeaderSearch = pathname !== '/' && !pathname.startsWith('/search');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#090A0F]/80 backdrop-blur-xl transition-all shadow-xs">
      {/* Subtle top ambient indicator */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-amber-400 opacity-80" />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 max-w-7xl">
        {/* Logo */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Logo size="md" />
        </div>

        {/* Header Command Search (Visible when not on homepage) */}
        {showHeaderSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 animate-in fade-in-50 duration-200">
            <SearchBox placeholder="Type ⌘K to search solutions, notes..." />
          </div>
        )}

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all group relative',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-white/[0.06] border border-indigo-500/20 dark:border-white/[0.1]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5 transition-transform group-hover:scale-110', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Theme Toggle & Admin) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />

          {/* Admin portal shortcut for educators */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08]"
            title="Admin Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-mono text-[11px]">Admin</span>
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] focus:outline-none transition-colors border border-slate-200 dark:border-white/[0.08]"
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
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Mail className="w-4 h-4 text-indigo-500" />
              Contact Editorial
            </Link>

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

