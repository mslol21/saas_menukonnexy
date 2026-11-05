import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Konnexy Menu | Cardápio Digital Inteligente',
    short_name: 'Konnexy Menu',
    description: 'Cardápio digital para restaurantes, bares e cafeterias.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050711',
    theme_color: '#22d3ee',
    icons: [
      {
        src: '/konnexy-logo.jpg',
        sizes: '1024x558',
        type: 'image/jpeg',
      },
    ],
  };
}
