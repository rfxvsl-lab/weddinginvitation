import { MetadataRoute } from 'next';
import { getAllUsers } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ruanghadir.net';
  
  let users = [];
  try {
    users = await getAllUsers();
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

  for (const user of users) {
    if (user.activeSlug && user.paymentStatus === 'success') {
      entries.push({
        url: `${appUrl}/${user.activeSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
