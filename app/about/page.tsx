import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  BookOpen,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  FileCheck,
  Scale,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Doubtly — Academic Mission & Verification Protocol',
  description:
    'Learn about Doubtly’s peer-verification editorial methodology, open STEM archive standards, and academic mission to make complex doubts understandable.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4 bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Rigor & Transparency</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Democratizing Mathematical & Scientific Understanding
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            Doubtly was founded to solve a fundamental challenge in online learning: fragmented, paywalled,
            or hallucinated answers to high-level academic doubts. We curate open, step-by-step verified solutions
            with mathematical derivations and reproducible scientific formulas.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Platform Access', value: '100% Free', desc: 'No paywalls or token limits' },
            { label: 'Verification Standard', value: 'Double-Blind', desc: 'Peer-reviewed by STEM editors' },
            { label: 'Search Latency', value: '< 100ms', desc: 'Sub-second edge retrieval' },
            { label: 'Academic Citations', value: 'Standard Text', desc: 'Aligned with top curricula' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile text-center space-y-1"
            >
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-indigo-600 dark:text-indigo-400">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">{stat.label}</div>
              <div className="text-[11px] font-mono text-slate-400">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Verification Protocol */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" /> Editorial Governance
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
              The Doubtly Verification Protocol
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Every solved problem published on Doubtly undergoes a structured 4-phase editorial review before being awarded the &ldquo;Peer-Verified&rdquo; badge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: '01',
                title: 'Constraint & Boundary Audit',
                desc: 'Confirming that all physical assumptions, domain bounds, and initial conditions are mathematically consistent.',
              },
              {
                step: '02',
                title: 'Symbolic & KaTeX Derivation',
                desc: 'Formulating step-by-step intermediate algebra without skipping conceptual leaps or introducing arithmetic anomalies.',
              },
              {
                step: '03',
                title: 'Dimensional Analysis & Units',
                desc: 'Checking that SI units, physical dimensions, and chemistry equilibrium reactions balance strictly.',
              },
              {
                step: '04',
                title: 'Alternative Solution Cross-Check',
                desc: 'Solving through an alternate algebraic or graphical route to verify the final verdict with absolute certainty.',
              },
            ].map((p) => (
              <div
                key={p.step}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] flex items-start gap-4"
              >
                <span className="text-2xl font-heading font-black text-indigo-500/40 dark:text-indigo-400/30">
                  {p.step}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributor Standards & Academic Source Integrity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
              Academic Source Citations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We align problem breakdowns with standard university and high-school benchmark curricula, including Thomas&apos; Calculus, Halliday &amp; Resnick Physics, Morrison &amp; Boyd Organic Chemistry, and Cormen et al. Algorithms.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
              Contributor Ethics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Solutions are designed for mastery and conceptual comprehension. We prohibit the submission of live, in-progress examination prompts and uphold international academic honor codes.
            </p>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/30 via-slate-900/40 to-cyan-900/30 border border-indigo-500/30 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Have a doubt or want to contribute a verified derivation?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Explore our search repository or reach out to our editorial panel for corrections and partnership inquiries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/search"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              Search Solved Doubts
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              Contact Editorial Board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

