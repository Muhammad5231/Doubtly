'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  Video,
  BookOpen,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // If on login page, render bare layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Questions & Answers', href: '/admin/questions', icon: HelpCircle },
    { name: 'Study Notes & PDFs', href: '/admin/notes', icon: FileText },
    { name: 'Video Lessons', href: '/admin/videos', icon: Video },
    { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#0B0F19]">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-[#111625]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-40">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle admin menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={cn(
          'w-64 bg-white/90 dark:bg-[#111625]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 flex-shrink-0 flex flex-col justify-between transition-all duration-300 z-50',
          'fixed inset-y-0 left-0 md:static md:translate-x-0 shadow-lg md:shadow-none',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Logo size="sm" />
            <span className="text-[10px] uppercase font-bold tracking-widest bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded-full">
              Console
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary-600 text-white font-semibold shadow-sm shadow-primary-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2 bg-slate-50/50 dark:bg-[#0E1322]/50">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Live Website
            </span>
          </Link>

          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors flex-1"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

