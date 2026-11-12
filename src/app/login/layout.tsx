import type { Metadata } from 'next';
import { NO_INDEX } from '@/lib/seo/site';
export const metadata: Metadata = { title: 'Entrar no painel', robots: NO_INDEX };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
