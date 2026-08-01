import { MetadataRoute } from 'next';
import { MOCK_TENANTS } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://konnexymenu.vercel.app';

  const tenantUrls = MOCK_TENANTS.map((t) => ({
    url: `${baseUrl}/menu/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...tenantUrls,
  ];
}
