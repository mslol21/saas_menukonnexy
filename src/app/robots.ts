import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/master/'],
    },
    sitemap: 'https://konnexymenu.vercel.app/sitemap.xml',
  };
}
