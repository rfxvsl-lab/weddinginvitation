import type { MetadataRoute } from 'next';
import { getPublishedSlugs } from '../lib/db';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ruanghadir.net';
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${appUrl}/preview`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    const slugs = await getPublishedSlugs();
    for (const slug of new Set(slugs)) {
      entries.push({ url: `${appUrl}/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 });
    }
  } catch (err) {
    console.error('Sitemap dynamic fetch failed:', err);
  }
  return entries;
}
