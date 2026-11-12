import type { MetadataRoute } from 'next';
import { SITE_URL, isPreview } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Demo fixtures are not real businesses. Add merchant URLs only after
  // verifying their publication status and public data source.
  return isPreview ? [] : [{ url: SITE_URL, changeFrequency: 'weekly', priority: 1 }];
}
