'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'How do I suggest a correction to an existing derivation?',
    a: 'Select "Doubt Correction" in the inquiry form below, include the exact question URL or title, and detail which mathematical step or equation requires review. Our editorial board verifies reports within 24 hours.',
  },
  {
    q: 'Is Doubtly free for educational institutions and professors?',
    a: 'Yes, Doubtly is 100% free and open access. You are welcome to link our step-by-step derivations in lecture syllabi or problem set reference sheets.',
  },
  {
    q: 'How can our institution partner or contribute note collections?',
    a: 'Select "Academic Partnership" in the inquiry dropdown. We actively collaborate with university departments, tutoring networks, and student academic societies to index high-quality STEM revision sheets.',
  },
  {
    q: 'Does Doubtly permit taking live exam answers?',
    a: 'No. Doubtly strictly prohibits using the platform during active timed examinations. We support honest, independent conceptual mastery and honor international academic integrity codes.',
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Doubt Correction');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 font-sans">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Editorial & Support Communication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-950 dark:text-white tracking-tight">
            Contact Doubtly Academic Board
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Report a formula discrepancy, suggest an academic partnership, or send feedback to our editorial maintainers.
          </p>
        </div>

        {/* Contact Form & Direct Channel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0D0F17] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-tactile">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                  Message Dispatched to Editorial Team
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-700 dark:text-slate-200">{name}</span>. Your inquiry regarding &ldquo;{inquiryType}&rdquo; has been logged. Our STEM reviewers will review it promptly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="text-xs font-mono text-indigo-500 hover:underline"
                  >
                    Submit Another Inquiry &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                  Submit an Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@university.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Doubt Correction">Doubt Correction / Step Discrepancy</option>
                    <option value="Academic Partnership">Academic Partnership / Syllabus Linking</option>
                    <option value="Bug Report">Technical Bug Report</option>
                    <option value="Feedback">General Editorial Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Detailed Message / Question URL *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please include question URLs, formula notation, or specific details..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Dispatch Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Right: Direct Contacts & Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Direct Editorial Inboxes
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06]">
                  <div className="text-slate-400">Corrections & Math Audits</div>
                  <div className="text-indigo-500 font-semibold mt-0.5">editorial@doubtly.org</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06]">
                  <div className="text-slate-400">Copyright & DMCA Agent</div>
                  <div className="text-indigo-500 font-semibold mt-0.5">legal@doubtly.org</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-2 text-xs text-slate-500 leading-relaxed">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Response SLAs
              </div>
              <p>
                Academic corrections receive priority triage within 24 to 48 hours. When submitting a formula audit, please cite the textbook edition and section when applicable.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#0D0F17] border border-slate-200/80 dark:border-white/[0.08] shadow-tactile space-y-6">
          <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> Frequently Answered Questions
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
            Common Inquiries
          </h2>

          <div className="space-y-3 pt-2">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-heading font-semibold text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform duration-200',
                        isOpen && 'rotate-180 text-indigo-500'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

