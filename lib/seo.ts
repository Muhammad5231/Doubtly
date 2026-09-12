export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_NAME = 'Doubtly';
export const SITE_TAGLINE = 'Every doubt, solved.';

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, maxLen = 155): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim() + '...';
}

/**
 * Generate a clean, SEO-optimized keyword slug
 * Strips accents, punctuation, and preserves key STEM symbols where appropriate
 */
export function generateSeoSlug(title: string, subjectName?: string): string {
  let base = title.toLowerCase();

  // If subject is provided and not in title, prepend or include it
  if (subjectName && !base.includes(subjectName.toLowerCase())) {
    base = `${subjectName} ${base}`;
  }

  return base
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Generates high-CTR meta descriptions (150-160 chars) summarizing problem & verdict
 */
export function generateMetaDescription(title: string, answerText: string): string {
  const cleanTitle = stripHtml(title);
  const cleanAns = stripHtml(answerText);

  // Extract first 1-2 punchy sentences of solution
  const firstSentences = cleanAns.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ');
  const combined = `${cleanTitle}: ${firstSentences}`.trim();

  if (combined.length <= 160 && combined.length >= 120) {
    return combined;
  }

  if (combined.length > 160) {
    return combined.slice(0, 157).trim() + '...';
  }

  return truncate(cleanAns.length > 20 ? `${cleanTitle} — ${cleanAns}` : cleanTitle, 158);
}

/**
 * Extracts a punchy 2-sentence direct verdict for AI / GEO answers
 */
export function extractDirectAnswerVerdict(title: string, answer: string): { formula: string | null; verdict: string } {
  const plainAnswer = stripHtml(answer);

  // Check if answer contains LaTeX display formula or inline formula
  const formulaMatch = answer.match(/\$\$([^$]+)\$\$/) || answer.match(/\$([^$]+)\$/);
  const formula = formulaMatch ? formulaMatch[1].trim() : null;

  // Extract first 2 meaningful sentences
  const sentences = plainAnswer
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.length > 10 && !s.toLowerCase().startsWith('step 1'));

  const verdict = sentences.slice(0, 2).join(' ') || plainAnswer.slice(0, 180).trim() + '...';

  return { formula, verdict };
}

/**
 * Google Structured Data: QAPage JSON-LD Schema
 */
export function generateQuestionJsonLd({
  title,
  body,
  answer,
  dateCreated,
  upvoteCount = 0,
  url,
  authorName = 'Doubtly Academic Editorial',
}: {
  title: string;
  body: string;
  answer: string;
  dateCreated: string;
  upvoteCount: number;
  url: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: stripHtml(body) || title,
      answerCount: 1,
      upvoteCount: Math.max(0, upvoteCount),
      dateCreated: dateCreated,
      url: url,
      author: {
        '@type': 'Organization',
        name: authorName,
      },
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(answer),
        dateCreated: dateCreated,
        upvoteCount: Math.max(1, upvoteCount),
        url: `${url}#solution`,
        author: {
          '@type': 'Organization',
          name: authorName,
          url: SITE_URL,
        },
      },
    },
  };
}

/**
 * Google Structured Data: BreadcrumbList JSON-LD Schema
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Google Structured Data: LearningResource / Article for Notes
 */
export function generateLearningResourceJsonLd({
  title,
  description,
  datePublished,
  url,
  fileUrl,
  educationalLevel = 'High School / Undergraduate',
  learningResourceType = 'Lecture Notes, Study Sheet',
}: {
  title: string;
  description: string;
  datePublished: string;
  url: string;
  fileUrl: string;
  educationalLevel?: string;
  learningResourceType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LearningResource', 'Article'],
    headline: title,
    description: stripHtml(description),
    datePublished: datePublished,
    url: url,
    educationalLevel: educationalLevel,
    learningResourceType: learningResourceType,
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: fileUrl,
    },
  };
}
