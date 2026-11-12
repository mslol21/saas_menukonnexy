import type { Metadata } from 'next';

export const SITE_URL = 'https://menu.konnexy.com.br';
export const SITE_NAME = 'Konnexy Menu';
export const SITE_TITLE = 'Cardápio digital com QR Code e WhatsApp | Konnexy Menu';
export const SITE_DESCRIPTION = 'Cardápio digital para restaurantes, bares e lanchonetes. Atualize produtos e preços, compartilhe por QR Code e receba pedidos no WhatsApp, sem comissão.';
export const isPreview = Boolean(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production');
export const NO_INDEX: Metadata['robots'] = { index: false, follow: false };
export const PUBLIC_ROBOTS: Metadata['robots'] = isPreview ? NO_INDEX : {
  index: true, follow: true,
  googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
};

export function publicMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, SITE_URL).href;
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url }, robots: PUBLIC_ROBOTS,
    openGraph: { type: 'website', locale: 'pt_BR', siteName: SITE_NAME, title, description, url,
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Konnexy Menu — cardápio digital, QR Code e pedidos no WhatsApp' }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/opengraph-image`] },
  };
}

// Escape user-supplied text before embedding JSON in a script element.
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
