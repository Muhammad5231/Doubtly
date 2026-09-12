'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Heart, Sparkles, Shield, BookOpen, Search, ExternalLink } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-surface-darkCard/30 transition-colors mt-auto">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Every doubt, solved. An open, completely free academic archive where curious
              students search solved questions, read step-by-step verified derivations, and download revision sheets.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-surface-darkCard px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-spark" />
              <span>Full-text & Trigram fuzzy search powered by PostgreSQL</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 font-heading">
              Explore Doubts
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/search?type=questions" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  All Solved Questions
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Study Notes & Cheat Sheets
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Video Lessons
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Trending Topics
                </Link>
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 font-heading">
              Core Subjects
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/subject/mathematics" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link href="/subject/physics" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Physics
                </Link>
              </li>
              <li>
                <Link href="/subject/chemistry" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Chemistry
                </Link>
              </li>
              <li>
                <Link href="/subject/computer-science" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Computer Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 font-heading">
              Platform & Integrity
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/admin/login" className="inline-flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-primary-500" />
                  <span>Admin Sign In</span>
                </Link>
              </li>
              <li className="text-xs text-slate-400 pt-2 leading-relaxed">
                Academic integrity first. Solutions are intended for conceptual mastery and independent study.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Doubtly. Free education for learners everywhere.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>for frictionless student learning.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

