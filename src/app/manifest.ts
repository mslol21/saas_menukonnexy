import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Konnexy Menu | Cardápio Digital Inteligente',
    short_name: 'Konnexy Menu',
    description: 'Cardápio digital para restaurantes, bares e cafeterias.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#FF5722',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
