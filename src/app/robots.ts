import type { MetadataRoute } from 'next';
import { SITE_URL, isPreview } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  // Keep HTML routes crawlable so crawlers can read their noindex directives.
  // This is an indexing policy, not an authentication mechanism.
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ...(isPreview ? {} : { sitemap: `${SITE_URL}/sitemap.xml` }),
  };
}
