import { cache } from 'react';
import { MOCK_TENANTS } from '@/lib/mock-data';
import { SECTOR_TEMPLATES } from '@/lib/templates';

export const isDemoSlug = (slug: string) =>
  MOCK_TENANTS.some((tenant) => tenant.slug === slug) || SECTOR_TEMPLATES.some((template) => template.id === slug);

type PublicMenuIdentity = { name: string; description: string; slug: string };

// Only the existing public view and anonymous key are used. Never query the
// private tenants table or use service-role credentials for search metadata.
export const getPublicMenuIdentity = cache(async (slug: string): Promise<PublicMenuIdentity | null> => {
  if (isDemoSlug(slug) || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;
  const query = new URLSearchParams({ select: 'name,description,slug', slug: `eq.${slug}`, subscription_status: 'eq.active', limit: '1' });
  try {
    const response = await fetch(`${base}/rest/v1/public_tenants?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store', signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const rows: unknown = await response.json();
    if (!Array.isArray(rows)) return null;
    const tenant = rows[0];
    if (!tenant || tenant.slug !== slug || typeof tenant.name !== 'string' || !tenant.name.trim()) return null;
    return { name: tenant.name.trim(), slug, description: typeof tenant.description === 'string' ? tenant.description : '' };
  } catch {
    return null;
  }
});
