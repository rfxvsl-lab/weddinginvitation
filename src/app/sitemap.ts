import { MetadataRoute } from 'next';
import { getPublicSlugs } from '../server/repo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ruanghadir.net';
  
  let slugs: string[] = [];
  try {
    slugs = await getPublicSlugs();
  } catch (err) {
    console.error('Sitemap dynamic fetch failed:', err);
  }

  const entries: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  for (const slug of slugs) {
    entries.push({
      url: `${appUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return entries;
}
