import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/master/'],
    },
    sitemap: 'https://konnexy.com.br/sitemap.xml',
  };
}
