import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF5722',
};

export const metadata: Metadata = {
  title: 'Konnexy Menu | Plataforma de Cardápio Digital Inteligente SaaS',
  description: 'O melhor cardápio digital para restaurantes, cafeterias, hamburguerias e bares. Sem comissão sobre vendas, integrado ao WhatsApp e QR Code por mesa.',
  keywords: ['cardapio digital', 'restaurante saas', 'qr code mesa', 'pedido whatsapp', 'menu online', 'konnexy menu'],
  authors: [{ name: 'Konnexy Tech Team' }],
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        <ThemeProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
