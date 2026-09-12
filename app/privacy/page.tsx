import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Doubtly Academic Archive',
  description:
    'Doubtly’s privacy principles: anonymous student browsing, zero student profiling, zero third-party data broker sales, and minimal telemetry.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-500 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Privacy & Data Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-950 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400">
            Effective: September 2026 • Version 1.2
          </p>
        </div>

        {/* Content Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              1. Our Core Privacy Philosophy
            </h2>
            <p>
              Doubtly operates on a strict principle of <strong>anonymous academic access</strong>.
              Students and learners do not register personal accounts, provide email addresses, or create personal profiles to view solved questions, mathematical derivations, or download PDF notes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              2. Information We Do Not Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>No user names, student IDs, phone numbers, or passwords for public browsing.</li>
              <li>No behavioral tracking across external websites or third-party advertising retargeting pixels.</li>
              <li>No sale, lease, or monetization of student search queries to third-party data brokers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              3. Telemetry & Edge Logging
            </h2>
            <p className="text-xs sm:text-sm">
              To guarantee sub-100ms response times and protect platform availability against denial-of-service attempts, our edge servers log aggregate, non-personally identifiable metrics (such as aggregate page view increments, search latency percentiles, and IP addresses hashed for rate-limiting).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              4. Cookies & Local Storage
            </h2>
            <p className="text-xs sm:text-sm">
              Doubtly uses local storage strictly to remember your interface preferences (such as light/dark mode selection) and track helpful vote submissions locally to prevent accidental double-voting. We do not use third-party tracking cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              5. Contact Us
            </h2>
            <p className="text-xs sm:text-sm">
              For privacy audits or data protection inquiries, contact our data protection team at{' '}
              <a href="mailto:privacy@doubtly.org" className="text-indigo-500 hover:underline font-mono">
                privacy@doubtly.org
              </a>{' '}
              or visit our <Link href="/contact" className="text-indigo-500 hover:underline">Contact Page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

