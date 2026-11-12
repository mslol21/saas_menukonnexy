import type { Metadata } from 'next';
import { getPublicMenuIdentity, isDemoSlug } from '@/lib/seo/public-menu';
import { publicMetadata, NO_INDEX } from '@/lib/seo/site';

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getPublicMenuIdentity(slug);
  const title = tenant ? `${tenant.name} — Cardápio digital | Konnexy Menu` :
    isDemoSlug(slug) ? 'Demonstração de cardápio digital | Konnexy Menu' : 'Cardápio digital | Konnexy Menu';
  const description = tenant ? `${tenant.name}: ${tenant.description || 'Consulte os produtos e preços no cardápio digital.'}`.slice(0, 180) :
    'Conheça a experiência do cardápio digital Konnexy Menu: produtos, categorias, filtros e carrinho com envio para o WhatsApp.';
  const metadata = publicMetadata(title, description, `/menu/${encodeURIComponent(slug)}`);
  // Unknown/demo routes can render fixture/local data in the existing client.
  // Do not publish these as real restaurants in search results.
  return { ...metadata, ...(!tenant ? { robots: NO_INDEX } : {}) };
}
export default function MenuLayout({ children }: Props) { return children; }
