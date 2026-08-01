-- ========================================================
-- KONNEXY MENU - BANCO DE DADOS & SEGURANÇA MULTI-TENANT POR USUÁRIO
-- Supabase Auth + PostgreSQL RLS + Triggers de Onboarding Automático
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'master')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE TENANTS (RESTAURANTES / CLIENTES)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop',
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=500&fit=crop',
  description TEXT,
  phone TEXT DEFAULT '(11) 99999-8888',
  whatsapp TEXT NOT NULL DEFAULT '5511999998888',
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  website TEXT,
  address TEXT DEFAULT 'Endereço a definir no painel',
  google_maps_url TEXT,
  opening_hours JSONB DEFAULT '{"mon_fri": "11:00 - 23:00", "sat_sun": "12:00 - 00:00"}'::jsonb,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'trial', 'cancelled')),
  subscription_plan TEXT DEFAULT 'monthly' CHECK (subscription_plan IN ('monthly', 'annual')),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  theme_config JSONB DEFAULT '{"primary_color": "#FF5722", "mode": "dark", "style": "glass"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 4. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  promo_price NUMERIC(10, 2),
  image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
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
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  table_number INT,
  category_slug TEXT,
  target_url TEXT NOT NULL,
  scans_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA DE ANALYTICS / EVENTOS
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'qr_scan', 'product_view', 'whatsapp_click')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  table_number INT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- ÍNDICES DE DESEMPENHO E SEGURANÇA
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_sort ON public.categories(tenant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_tenant_cat_sort ON public.products(tenant_id, category_id, sort_order);

-- ========================================================
-- TRIGGER DE AUTOMAÇÃO NO SIGNUP DO SUPABASE AUTH
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  rest_name TEXT;
  clean_slug TEXT;
  new_tenant_id UUID;
  cat_id UUID;
BEGIN
  -- 1. Criar Profile do Usuário
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'owner')
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Extrair Nome do Restaurante do metadata do signup
  rest_name := COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'Meu Restaurante');
  clean_slug := lower(regexp_replace(rest_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(NEW.id::text, 1, 4);

  -- 3. Inserir Tenant com privilégios de Administrador (bypassing RLS)
  INSERT INTO public.tenants (owner_id, name, slug, whatsapp, description, address, subscription_status)
  VALUES (
    NEW.id,
    rest_name,
    clean_slug,
    '5511999998888',
    'Cardápio digital inteligente de ' || rest_name,
    'Endereço a definir no painel',
    'active'
  )
  RETURNING id INTO new_tenant_id;

  -- 4. Inserir Categoria Padrão para o novo restaurante
  IF new_tenant_id IS NOT NULL THEN
    INSERT INTO public.categories (tenant_id, name, slug, sort_order)
    VALUES (new_tenant_id, '🔥 Pratos Principais', 'pratos-principais', 1)
    RETURNING id INTO cat_id;

    -- 5. Inserir Produto Exemplo para o restaurante recém-criado
    IF cat_id IS NOT NULL THEN
      INSERT INTO public.products (tenant_id, category_id, name, slug, description, price, is_available)
      VALUES (
        new_tenant_id,
        cat_id,
        'Prato Especial da Casa',
        'prato-especial-casa',
        'Edite este produto no painel administrativo para adicionar seus próprios pratos, fotos e preços.',
        29.90,
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associar trigger ao auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Função de apoio para checagem de RLS
CREATE OR REPLACE FUNCTION public.is_tenant_owner(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = target_tenant_id 
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "Leitura pública de cardápios ativos" ON public.tenants FOR SELECT USING (subscription_status != 'suspended');
CREATE POLICY "Proprietário gerencia seu restaurante" ON public.tenants FOR ALL USING (owner_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Permitir inserção de tenant" ON public.tenants FOR INSERT WITH CHECK (true);

CREATE POLICY "Leitura pública de categorias" ON public.categories FOR SELECT USING (is_active = true OR is_tenant_owner(tenant_id));
CREATE POLICY "Proprietário gerencia suas categorias" ON public.categories FOR ALL USING (is_tenant_owner(tenant_id) OR auth.role() = 'service_role');

CREATE POLICY "Leitura pública de produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Proprietário gerencia seus produtos" ON public.products FOR ALL USING (is_tenant_owner(tenant_id) OR auth.role() = 'service_role');

CREATE POLICY "Proprietário gerencia seus qr_codes" ON public.qr_codes FOR ALL USING (is_tenant_owner(tenant_id));
CREATE POLICY "Registro público de analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Proprietário visualiza analytics" ON public.analytics_events FOR SELECT USING (is_tenant_owner(tenant_id));
