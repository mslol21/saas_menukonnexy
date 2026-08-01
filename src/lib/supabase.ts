import { createClient } from '@supabase/supabase-js';
import { MOCK_TENANTS, MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_ANALYTICS } from './mock-data';
import { Tenant, Category, Product } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};

export const DataService = {
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (data && !error) return data as Tenant;
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock:', err);
      }
    }

    // Check localStorage for newly created tenant
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('konnexy_user_tenant');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slug === slug) return parsed;
      }
    }

    const tenant = MOCK_TENANTS.find((t) => t.slug === slug);
    return tenant || MOCK_TENANTS[0];
  },

  async getCategoriesByTenant(tenantId: string): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (data && !error && data.length > 0) return data as Category[];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock:', err);
      }
    }
    return MOCK_CATEGORIES;
  },

  async getProductsByTenant(tenantId: string): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('sort_order', { ascending: true });

        if (data && !error && data.length > 0) return data as Product[];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock:', err);
      }
    }
    return MOCK_PRODUCTS;
  },

  async recordAnalyticsEvent(tenantId: string, eventType: 'page_view' | 'qr_scan' | 'product_view' | 'whatsapp_click', productId?: string, tableNumber?: number) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('analytics_events').insert({
          tenant_id: tenantId,
          event_type: eventType,
          product_id: productId || null,
          table_number: tableNumber || null,
        });
      } catch (err) {
        console.error('Failed to log analytics:', err);
      }
    }
  },

  async getAnalyticsSummary(tenantId: string) {
    return MOCK_ANALYTICS;
  }
};
