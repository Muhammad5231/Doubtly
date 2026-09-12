'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Heart, Sparkles, Shield, BookOpen, Search, ExternalLink, Scale, FileText, Mail, Info } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <footer className="border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#090A0F] transition-colors mt-auto font-sans">
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Every doubt, solved. An open, free academic archive where curious
              students search solved questions, read step-by-step verified derivations, and download revision sheets.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-white/[0.03] px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Edge Indexed • Sub-100ms Search • Zero Login</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Explore Doubts
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link href="/search?type=questions" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  All Solved Questions
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Study Notes & Sheets
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Video Lessons
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Trending Topics
                </Link>
              </li>
              <li>
                <Link href="/llms.txt" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors font-mono text-xs">
                  llms.txt (AI Index)
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Subjects */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Core Subjects
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link href="/subject/mathematics" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link href="/subject/physics" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Physics
                </Link>
              </li>
              <li>
                <Link href="/subject/chemistry" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Chemistry
                </Link>
              </li>
              <li>
                <Link href="/subject/computer-science" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Computer Science
                </Link>
              </li>
              <li>
                <Link href="/subject/biology" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Biology
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional & Trust */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Institutional &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link href="/about" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  About &amp; Verification
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Contact &amp; Corrections
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  Academic Terms &amp; DMCA
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-500 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Doubtly. Free academic archive.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms & DMCA</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
