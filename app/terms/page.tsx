import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, AlertCircle, FileCheck, ShieldAlert, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Academic Use & DMCA Policy — Doubtly',
  description:
    'Terms governing fair educational use, DMCA copyright compliance, citation guidelines, and academic integrity policies at Doubtly.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-4 bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-500 uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Academic Usage & Copyright Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-950 dark:text-white tracking-tight">
            Terms of Academic Use &amp; DMCA
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400">
            Last Updated: September 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              1. Permitted Educational Fair Use
            </h2>
            <p>
              Doubtly materials—including step-by-step mathematical derivations, LaTeX formulation breakdowns, conceptual summaries, and downloadable PDF revision sheets—are provided free of charge for individual study, classroom instruction, and educational reference.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              2. Academic Honor Code &amp; Exam Policy
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Strict Non-Assistance During Live Examinations
              </div>
              <p>
                You may not use Doubtly to obtain answers during a timed, proctored, or closed-book exam. Doubtly is a learning tool for mastering fundamentals, not a shortcut for real-time test compromise.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              3. Copyright Compliance &amp; DMCA Notice Instructions
            </h2>
            <p className="text-xs sm:text-sm">
              Doubtly respects the intellectual property rights of educators, publishers, and textbook authors. Our derivations are independent editorial pedagogical breakdowns created to explain mathematical and scientific concepts.
            </p>
            <p className="text-xs sm:text-sm">
              If you believe copyrighted material (such as verbatim textbook questions, diagrams, or proprietary exam problems) has been published on Doubtly without authorization, please transmit a formal DMCA Notice of Infringement to our designated agent containing:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>The exact Doubtly URL (`https://doubtly.org/q/...` or `/notes/...`) of the material to be removed.</li>
              <li>Your contact information (name, address, telephone number, and email).</li>
              <li>A statement of good-faith belief that the use is not authorized by the copyright owner.</li>
              <li>A statement made under penalty of perjury that the information is accurate and you are authorized to act.</li>
            </ul>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] text-xs font-mono text-slate-700 dark:text-slate-300">
              Designated Copyright Agent: <span className="text-indigo-500 font-semibold">legal@doubtly.org</span>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              4. Disclaimer of Academic Warranties
            </h2>
            <p className="text-xs sm:text-sm">
              While every derivation undergoes our rigorous 4-phase verification protocol, solutions are provided &ldquo;as is&rdquo;. Doubtly is not liable for grade outcomes or reliance on calculations in critical real-world engineering or physical applications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              5. Governing Law &amp; Inquiries
            </h2>
            <p className="text-xs sm:text-sm">
              These terms are governed by standard educational fair-use principles. Questions or notifications may be sent via our{' '}
              <Link href="/contact" className="text-indigo-500 hover:underline">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

