'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { Copy, Check, Terminal, FileCode, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StemRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

// KaTeX macros including basic chemistry and math shortcuts
const katexOptions = {
  throwOnError: false,
  strict: false,
  macros: {
    '\\ce': '\\mathrm{#1}',
    '\\pu': '\\mathrm{#1}',
    '\\degree': '^{\\circ}',
    '\\angstrom': '\\text{\\AA}',
  },
};

/**
 * Preprocess chemistry syntax if needed to assist KaTeX
 * e.g., converts simple inline arrows -> to \rightarrow in math blocks
 */
function preprocessStemContent(raw: string): string {
  if (!raw) return '';
  // Normalize Windows CRLF
  let text = raw.replace(/\r\n/g, '\n');

  // If text doesn't contain $ but looks like an equation (e.g. y = mx + c with integrals or fractions), leave as is.
  return text;
}

export function StemRenderer({ content, className, compact = false }: StemRendererProps) {
  const processed = preprocessStemContent(content);

  return (
    <div
      className={cn(
        'stem-prose prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200',
        'prose-headings:font-heading prose-headings:tracking-tight prose-headings:font-bold',
        'prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-slate-900 dark:prose-h2:text-white',
        'prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-slate-900 dark:prose-h3:text-slate-100',
        'prose-p:leading-relaxed prose-p:my-2.5',
        'prose-a:text-indigo-500 hover:prose-a:text-indigo-600 dark:hover:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline',
        'prose-strong:font-semibold prose-strong:text-slate-900 dark:prose-strong:text-white',
        'prose-table:border-collapse prose-th:p-2.5 prose-th:text-xs prose-th:font-mono prose-th:bg-slate-100 dark:prose-th:bg-white/[0.04] prose-td:p-2.5 prose-td:border prose-td:border-slate-200 dark:prose-td:border-white/[0.06] prose-td:text-sm',
        'prose-blockquote:border-l-2 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/20 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300',
        compact && 'text-sm prose-p:my-1 prose-headings:my-1',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, katexOptions], rehypeSlug]}
        components={{
          // Custom Headings with Step Detection
          h2({ node, children, ...props }) {
            const rawText = String(children);
            const stepMatch = rawText.match(/^Step\s+(\d+)[\s*:\-–—]+(.*)$/i);
            if (stepMatch) {
              const [, stepNum, stepTitle] = stepMatch;
              return (
                <div className="my-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/[0.08] to-cyan-500/[0.04] p-3.5 sm:p-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-500 text-white shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      STEP {stepNum}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white !my-0 font-heading">
                      {stepTitle || rawText}
                    </h2>
                  </div>
                </div>
              );
            }
            return <h2 {...props}>{children}</h2>;
          },

          h3({ node, children, ...props }) {
            const rawText = String(children);
            const stepMatch = rawText.match(/^Step\s+(\d+)[\s*:\-–—]+(.*)$/i);
            if (stepMatch) {
              const [, stepNum, stepTitle] = stepMatch;
              return (
                <div className="my-4 rounded-xl border border-indigo-500/25 bg-slate-50/80 dark:bg-white/[0.03] p-3 sm:p-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                      STEP {stepNum}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white !my-0 font-heading">
                      {stepTitle || rawText}
                    </h3>
                  </div>
                </div>
              );
            }
            return <h3 {...props}>{children}</h3>;
          },

          // Paragraph step detection
          p({ node, children, ...props }) {
            // Check if paragraph begins with "Step X:"
            if (
              Array.isArray(children) &&
              typeof children[0] === 'string' &&
              /^Step\s+\d+[\s*:\-–—]/i.test(children[0])
            ) {
              const firstStr = children[0];
              const match = firstStr.match(/^(Step\s+\d+)[\s*:\-–—]+(.*)$/i);
              if (match) {
                const stepLabel = match[1].toUpperCase();
                const remainder = match[2];
                return (
                  <div className="my-4 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#0B0D14]/70">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {stepLabel}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 !my-1 text-sm sm:text-base leading-relaxed">
                      {remainder ? [remainder, ...children.slice(1)] : children.slice(1)}
                    </p>
                  </div>
                );
              }
            }
            return <p {...props}>{children}</p>;
          },

          // Display Math & LaTeX block container with Copy LaTeX
          span({ node, className, children, ...props }) {
            const isDisplayMath = className?.includes('katex-display');
            if (isDisplayMath) {
              return (
                <DisplayMathContainer className={className} {...props}>
                  {children}
                </DisplayMathContainer>
              );
            }
            return (
              <span className={className} {...props}>
                {children}
              </span>
            );
          },

          // Code blocks with syntax copy button
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return (
                <CodeBlock
                  language={match ? match[1] : 'code'}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className={cn(
                  'px-1.5 py-0.5 rounded-md font-mono text-xs bg-slate-100 dark:bg-white/[0.06] text-indigo-600 dark:text-indigo-300 border border-slate-200/60 dark:border-white/[0.08]',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Display Math Container with Floating "Copy LaTeX" Button on Hover
 */
function DisplayMathContainer({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleCopyLatex = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    // Look for KaTeX MathML annotation holding raw LaTeX
    const annotation = containerRef.current.querySelector('annotation[encoding="application/x-tex"]');
    const latexText = annotation?.textContent || containerRef.current.innerText || '';

    navigator.clipboard.writeText(latexText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="group relative my-4 rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#07090E]/60 p-4 sm:p-5 overflow-x-auto transition-colors hover:border-indigo-500/40"
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={handleCopyLatex}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white/90 dark:bg-[#121520]/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/40 shadow-sm backdrop-blur transition-all"
          title="Copy raw LaTeX formula"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied LaTeX</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy LaTeX</span>
            </>
          )}
        </button>
      </div>
      <div className={cn('overflow-x-auto py-1', className)} {...props}>
        {children}
      </div>
    </div>
  );
}

/**
 * Enhanced Code Block with Language Tag and 1-Click Copy
 */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 rounded-xl border border-slate-800/80 bg-[#090B10] text-slate-200 overflow-hidden shadow-tactile">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-300">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed !bg-transparent !my-0 text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

