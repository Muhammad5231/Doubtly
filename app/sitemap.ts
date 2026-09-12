import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let questions: any[] = [];
  let notes: any[] = [];
  let subjects: any[] = [];

  try {
    const [q, n, s] = await Promise.all([
      db.question.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        take: 5000,
        orderBy: { updatedAt: 'desc' },
      }),
      db.note.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        take: 5000,
        orderBy: { updatedAt: 'desc' },
      }),
      db.subject.findMany({
        select: { slug: true, updatedAt: true },
        take: 100,
        orderBy: { order: 'asc' },
      }),
    ]);
    questions = q;
    notes = n;
    subjects = s;
  } catch (error) {
    console.error('Database connection unavailable during sitemap generation:', error);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/videos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  const questionEntries: MetadataRoute.Sitemap = questions.map((q) => ({
    url: `${SITE_URL}/q/${q.slug}`,
    lastModified: q.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const noteEntries: MetadataRoute.Sitemap = notes.map((n) => ({
    url: `${SITE_URL}/notes/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const subjectEntries: MetadataRoute.Sitemap = subjects.map((s) => ({
    url: `${SITE_URL}/subject/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...subjectEntries, ...questionEntries, ...noteEntries];
}

