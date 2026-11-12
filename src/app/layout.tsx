import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE_URL, SITE_NAME, PUBLIC_ROBOTS } from '@/lib/seo/site';
import { MotionProvider } from '@/components/ui/MotionProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050711',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: '%s | Konnexy Menu' },
  applicationName: SITE_NAME,
  robots: PUBLIC_ROBOTS,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/konnexy-logo.jpg', apple: '/konnexy-logo.jpg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        <MotionProvider><AuthProvider>
          <ThemeProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ThemeProvider>
        </AuthProvider></MotionProvider>
      </body>
    </html>
  );
}
