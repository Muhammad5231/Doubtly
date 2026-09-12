import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify on Node.js server side
let serverPurify: ReturnType<typeof DOMPurify> | null = null;
if (typeof window === 'undefined') {
  const windowMock = new JSDOM('').window;
  serverPurify = DOMPurify(windowMock as unknown as Window & typeof globalThis);
}

const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a', 'span', 'mark', 'hr', 'sub', 'sup'
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'class', 'id', 'title', 'align'
];

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  const purifier = typeof window !== 'undefined' ? DOMPurify : serverPurify;
  if (!purifier) return dirtyHtml;

  return purifier.sanitize(dirtyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  });
}

