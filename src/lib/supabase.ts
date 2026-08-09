import { createClient } from '@supabase/supabase-js';
import { MOCK_TENANTS, MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_ANALYTICS } from './mock-data';
import { SECTOR_TEMPLATES } from './templates';
import { Tenant, Category, Product, AnalyticsSummary, FilterTag } from '@/types';

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
    // 1. Check local storage by slug first for instant layout updates
    if (typeof window !== 'undefined') {
      const savedBySlug = localStorage.getItem(`konnexy_tenant_${slug}`);
      if (savedBySlug) {
        try {
          return JSON.parse(savedBySlug);
        } catch (e) {
          console.error(e);
        }
      }

      const savedUserTenant = localStorage.getItem('konnexy_user_tenant');
      if (savedUserTenant) {
        try {
          const parsed = JSON.parse(savedUserTenant);
          if (parsed.slug === slug) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 2. Check Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (data && !error) return data as Tenant;
      } catch (err) {
        console.warn('Supabase fetch failed, checking local & mock:', err);
      }
    }

    const tenant = MOCK_TENANTS.find((t) => t.slug === slug);
    if (tenant) return tenant;

    // Check if slug matches a sector template
    const matchedTemplate = SECTOR_TEMPLATES.find((tmpl) => tmpl.id === slug || slug.includes(tmpl.id));
    if (matchedTemplate) {
      return {
        id: `t-template-${matchedTemplate.id}`,
        name: matchedTemplate.name,
        slug: slug,
        logo_url: matchedTemplate.defaultLogo,
        banner_url: matchedTemplate.defaultBanner,
        description: matchedTemplate.description,
        phone: '(11) 99999-8888',
        whatsapp: '5511999998888',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        subscription_status: 'active',
        theme_config: matchedTemplate.theme,
        created_at: new Date().toISOString(),
      };
    }

    return MOCK_TENANTS[0];
  },

  async saveTenant(tenant: Tenant): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_tenant_${tenant.slug}`, JSON.stringify(tenant));
      localStorage.setItem(`konnexy_tenant_id_${tenant.id}`, JSON.stringify(tenant));

      const activeUserTenant = localStorage.getItem('konnexy_user_tenant');
      if (activeUserTenant) {
        try {
          const parsed = JSON.parse(activeUserTenant);
          if (parsed.id === tenant.id || parsed.slug === tenant.slug) {
            localStorage.setItem('konnexy_user_tenant', JSON.stringify(tenant));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (isSupabaseConfigured() && tenant.id) {
      try {
        await supabase.from('tenants').upsert(tenant);
      } catch (err) {
        console.error('Failed to sync tenant to Supabase:', err);
      }
    }

    return true;
  },

  async getCategoriesByTenant(tenantId: string): Promise<Category[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`konnexy_categories_${tenantId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('sort_order', { ascending: true });

        if (data && !error && data.length > 0) return data as Category[];
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }

    if (tenantId === 't-1' || tenantId === 'calixto-burger') return MOCK_CATEGORIES;

    // Match sector templates
    if (tenantId.includes('pizzaria') || tenantId === 't-2') {
      const tmpl = SECTOR_TEMPLATES.find((t) => t.id === 'pizzaria');
      return tmpl ? tmpl.categories.map((c, i) => ({ id: `cat-piz-${i}`, tenant_id: tenantId, name: c.name, slug: c.slug, sort_order: c.sort_order, is_active: true })) : [];
    }
    if (tenantId.includes('sushi') || tenantId === 't-3') {
      const tmpl = SECTOR_TEMPLATES.find((t) => t.id === 'sushibar');
      return tmpl ? tmpl.categories.map((c, i) => ({ id: `cat-sushi-${i}`, tenant_id: tenantId, name: c.name, slug: c.slug, sort_order: c.sort_order, is_active: true })) : [];
    }
    if (tenantId.includes('cafe') || tenantId === 't-4') {
      const tmpl = SECTOR_TEMPLATES.find((t) => t.id === 'cafeteria');
      return tmpl ? tmpl.categories.map((c, i) => ({ id: `cat-cafe-${i}`, tenant_id: tenantId, name: c.name, slug: c.slug, sort_order: c.sort_order, is_active: true })) : [];
    }

    return [];
  },

  async saveCategories(tenantId: string, categories: Category[]): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_categories_${tenantId}`, JSON.stringify(categories));
    }

    if (isSupabaseConfigured()) {
      try {
        const formatted = categories.map((c) => ({
          ...c,
          tenant_id: tenantId,
        }));
        await supabase.from('categories').upsert(formatted);
      } catch (err) {
        console.error('Failed to save categories to Supabase:', err);
      }
    }

    return true;
  },

  async getPublicProductsBySlug(slug: string): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('get_public_menu_products', { p_slug: slug });
        if (data && !error && data.length > 0) return data as Product[];
      } catch (err) {
        console.warn('RPC products fetch failed:', err);
      }
    }
    const tenant = await this.getTenantBySlug(slug);
    return tenant ? this.getProductsByTenant(tenant.id) : MOCK_PRODUCTS;
  },

  async getPublicCategoriesBySlug(slug: string): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('get_public_menu_categories', { p_slug: slug });
        if (data && !error && data.length > 0) return data as Category[];
      } catch (err) {
        console.warn('RPC categories fetch failed:', err);
      }
    }
    const tenant = await this.getTenantBySlug(slug);
    return tenant ? this.getCategoriesByTenant(tenant.id) : MOCK_CATEGORIES;
  },

  async getProductsByTenant(tenantId: string): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`konnexy_products_${tenantId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('sort_order', { ascending: true });

        if (data && !error && data.length > 0) return data as Product[];
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }

    if (tenantId === 't-1' || tenantId === 'calixto-burger') return MOCK_PRODUCTS;

    const mapTemplateProducts = (sectorId: string) => {
      const tmpl = SECTOR_TEMPLATES.find((t) => t.id === sectorId);
      if (!tmpl) return [];
      return tmpl.products.map((p, i) => ({
        id: `prod-${sectorId}-${i}`,
        tenant_id: tenantId,
        category_id: `cat-${sectorId}-${p.category_slug}`,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        promo_price: p.promo_price,
        image_url: p.image_url,
        ingredients: p.ingredients || [],
        is_available: true,
        sort_order: i + 1,
        is_featured: p.is_featured || false,
        is_bestseller: p.is_bestseller || false,
        filters: (p.filters || []) as FilterTag[],
      }));
    };

    if (tenantId.includes('pizzaria') || tenantId === 't-2') return mapTemplateProducts('pizzaria');
    if (tenantId.includes('sushi') || tenantId === 't-3') return mapTemplateProducts('sushibar');
    if (tenantId.includes('cafe') || tenantId === 't-4') return mapTemplateProducts('cafeteria');

    return [];
  },

  async saveProducts(tenantId: string, products: Product[]): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_products_${tenantId}`, JSON.stringify(products));
    }

    if (isSupabaseConfigured()) {
      try {
        const formatted = products.map((p) => ({
          ...p,
          tenant_id: tenantId,
        }));
        await supabase.from('products').upsert(formatted);
      } catch (err) {
        console.error('Failed to save products to Supabase:', err);
      }
    }

    return true;
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

  async getAnalyticsSummary(tenantId: string): Promise<AnalyticsSummary> {
    if (tenantId === 't-1' || tenantId === 'calixto-burger') {
      return MOCK_ANALYTICS;
    }

    return {
      total_views: 0,
      qr_scans: 0,
      whatsapp_clicks: 0,
      top_products: [],
      recent_activity: [],
    };
  }
};
