export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SITE_NAME = 'Doubtly';
export const SITE_TAGLINE = 'Every doubt, solved.';

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, maxLen = 155): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim() + '...';
}

export function generateQuestionJsonLd({
  title,
  body,
  answer,
  dateCreated,
  upvoteCount = 0,
  url,
}: {
  title: string;
  body: string;
  answer: string;
  dateCreated: string;
  upvoteCount: number;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: stripHtml(body),
      answerCount: 1,
      dateCreated: dateCreated,
      url: url,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(answer),
        dateCreated: dateCreated,
        upvoteCount: upvoteCount,
        url: `${url}#answer`,
      },
    },
  };
}

export function generateNoteJsonLd({
  title,
  description,
  datePublished,
  url,
  fileUrl,
}: {
  title: string;
  description: string;
  datePublished: string;
  url: string;
  fileUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: stripHtml(description),
    datePublished: datePublished,
    url: url,
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

