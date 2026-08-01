-- ========================================================
-- KONNEXY MENU - ESTRUTURA DE SEGURANÇA E RLS MULTI-TENANT POR USUÁRIO
-- Supabase Auth + PostgreSQL Row Level Security (RLS)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS (VINCULADA AO AUTH.USERS DO SUPABASE)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'master')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE TENANTS (RESTAURANTES / CLIENTES)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Proprietário do restaurante
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

-- 3. TABELA DE CATEGORIAS
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

-- 4. TABELA DE PRODUTOS
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
  filters TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 5. TABELA DE QR CODES
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  table_number INT,
  category_slug TEXT,
  target_url TEXT NOT NULL,
  scans_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA DE ANALYTICS / EVENTOS DE ACESSO
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
-- ÍNDICES DE DESEMPENHO E SEGURANÇA
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_sort ON categories(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_tenant_cat_sort ON products(tenant_id, category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_analytics_tenant_event ON analytics_events(tenant_id, event_type, created_at);

-- ========================================================
-- POLÍTICAS ESTRITAS DE ROW LEVEL SECURITY (RLS)
-- ========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Funções auxiliares de checagem de propriedade no PostgreSQL
CREATE OR REPLACE FUNCTION is_tenant_owner(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenants 
    WHERE id = target_tenant_id 
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------
-- POLÍTICAS PARA PROFILES
-- --------------------------------------------------------
CREATE POLICY "Usuário lê apenas seu próprio perfil"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário edita apenas seu próprio perfil"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- --------------------------------------------------------
-- POLÍTICAS PARA TENANTS
-- --------------------------------------------------------
-- 1. Leitura pública apenas para restaurantes ativos
CREATE POLICY "Leitura pública de cardápios ativos"
  ON tenants FOR SELECT
  USING (subscription_status != 'suspended');

-- 2. Modificação restrita estritamente ao proprietário autenticado
CREATE POLICY "Proprietário gerencia apenas seu restaurante"
  ON tenants FOR ALL
  USING (owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'master');

-- --------------------------------------------------------
-- POLÍTICAS PARA CATEGORIAS
-- --------------------------------------------------------
CREATE POLICY "Leitura pública de categorias ativas"
  ON categories FOR SELECT
  USING (is_active = true OR is_tenant_owner(tenant_id));

CREATE POLICY "Proprietário gerencia apenas suas categorias"
  ON categories FOR ALL
  USING (is_tenant_owner(tenant_id));

-- --------------------------------------------------------
-- POLÍTICAS PARA PRODUTOS
-- --------------------------------------------------------
CREATE POLICY "Leitura pública de produtos"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Proprietário gerencia apenas seus produtos"
  ON products FOR ALL
  USING (is_tenant_owner(tenant_id));

-- --------------------------------------------------------
-- POLÍTICAS PARA QR CODES & ANALYTICS
-- --------------------------------------------------------
CREATE POLICY "Proprietário gerencia apenas seus qr_codes"
  ON qr_codes FOR ALL
  USING (is_tenant_owner(tenant_id));

CREATE POLICY "Registro público de eventos de acesso"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Proprietário visualiza analytics do seu restaurante"
  ON analytics_events FOR SELECT
  USING (is_tenant_owner(tenant_id));
