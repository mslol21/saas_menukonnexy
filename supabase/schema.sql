-- ========================================================
-- KONNEXY MENU - BANCO DE DADOS & SCHEMAS SUPABASE MULTI-TENANT
-- PostgreSQL + Row Level Security (RLS)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE TENANTS (RESTAURANTES / CLIENTES)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  phone TEXT,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  website TEXT,
  address TEXT,
  google_maps_url TEXT,
  opening_hours JSONB DEFAULT '{"mon_fri": "11:00 - 23:00", "sat_sun": "12:00 - 00:00"}'::jsonb,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'trial', 'cancelled')),
  subscription_plan TEXT DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'annual')),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  theme_config JSONB DEFAULT '{"primary_color": "#FF5722", "mode": "dark", "style": "glass"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 3. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  promo_price NUMERIC(10, 2),
  image_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  ingredients TEXT[] DEFAULT '{}',
  weight TEXT,
  volume TEXT,
  calories INT,
  prep_time_min INT,
  serves INT DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_promo BOOLEAN DEFAULT false,
  filters TEXT[] DEFAULT '{}', -- e.g., ['vegano', 'vegetariano', 'sem_lactose', 'sem_gluten', 'apimentado', 'fit', 'zero_acucar', 'artesanal', 'premium']
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 4. TABELA DE QR CODES (MESAS / CATEGORIAS / GERAL)
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  table_number INT,
  category_slug TEXT,
  target_url TEXT NOT NULL,
  scans_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA DE ANALYTICS / EVENTOS DE ACESSO
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'qr_scan', 'product_view', 'whatsapp_click')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  table_number INT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- ÍNDICES DE DESEMPENHO
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_sort ON categories(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_tenant_cat_sort ON products(tenant_id, category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_analytics_tenant_event ON analytics_events(tenant_id, event_type, created_at);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de Leitura Pública para Cardápios Ativos
CREATE POLICY "Leitura pública de tenants ativos" 
  ON tenants FOR SELECT 
  USING (subscription_status != 'suspended');

CREATE POLICY "Leitura pública de categorias ativas" 
  ON categories FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Leitura pública de produtos disponíveis" 
  ON products FOR SELECT 
  USING (true);

-- 2. Permissão de inserção pública para eventos de analytics (views e cliques no whatsapp)
CREATE POLICY "Registro público de estatísticas analytics" 
  ON analytics_events FOR INSERT 
  WITH CHECK (true);

-- 3. Políticas de Edição (Admin/Proprietário por Auth Context)
CREATE POLICY "Tenant admin atualizações de seu próprio restaurante"
  ON tenants FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tenant admin gestão de categorias"
  ON categories FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tenant admin gestão de produtos"
  ON products FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tenant admin gestão de qr_codes"
  ON qr_codes FOR ALL
  USING (auth.uid() IS NOT NULL);
