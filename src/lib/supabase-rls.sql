-- ==============================================================================
-- MENU KONNEXY SAAS - SCRIPT SQL COMPLETO & BLINDADO (POSTGRESQL + RPC + RLS 4.0)
-- Versão 4.0.0 • Produção • DCL Correta (anon revogada / authenticated liberada com RLS)
-- ==============================================================================

-- 1. Habilitar RLS em TODAS as tabelas do sistema
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 2. Limpeza prévia de políticas antigas na tabela tenants
DROP POLICY IF EXISTS "Public select active tenant" ON tenants;
DROP POLICY IF EXISTS "Public read tenants" ON tenants;
DROP POLICY IF EXISTS "Admin manage own tenant" ON tenants;
DROP POLICY IF EXISTS "Admin select own categories" ON categories;
DROP POLICY IF EXISTS "Admin manage own categories" ON categories;
DROP POLICY IF EXISTS "Admin select own products" ON products;
DROP POLICY IF EXISTS "Admin manage own products" ON products;
DROP POLICY IF EXISTS "Admin manage orders" ON orders;
DROP POLICY IF EXISTS "Admin manage tables" ON restaurant_tables;
DROP POLICY IF EXISTS "Admin read analytics" ON analytics_events;
DROP POLICY IF EXISTS "Allow server analytics insert" ON analytics_events;

-- ==============================================================================
-- 3. CAMADA DCL (GRANT/REVOKE): BLOQUEIO TOTAL DA ROLE 'ANON'
-- Impede acesso direto do público não autenticado às tabelas brutas
-- ==============================================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON tenants FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON products FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON categories FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON orders FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON restaurant_tables FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON analytics_events FROM anon;

-- Conceder permissão de tabela de base para a role 'authenticated' (Admin Logado)
-- EXPLÍCITO POR TABELA — evita expor tabelas futuras não auditadas
-- A segurança de isolamento por restaurante é garantida pelas políticas de RLS abaixo
GRANT SELECT, INSERT, UPDATE, DELETE ON tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurant_tables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_events TO authenticated;

-- Tabelas futuras nascem SEM grant — cada nova tabela requer decisão consciente de exposição
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;

-- ==============================================================================
-- 4. VIEW PÚBLICA SEGURA: public_tenants (Lê apenas colunas públicas)
-- ==============================================================================
CREATE OR REPLACE VIEW public_tenants AS
SELECT 
  id,
  name,
  slug,
  logo_url,
  banner_url,
  description,
  phone,
  whatsapp,
  address,
  theme_config,
  subscription_status
FROM tenants
WHERE subscription_status = 'active';

-- Conceder leitura da VIEW pública segura para usuários anônimos do cardápio
GRANT SELECT ON public_tenants TO anon, authenticated;

-- ==============================================================================
-- 5. FUNÇÃO RPC SECURITY DEFINER: PRODUTOS (Com search_path blindado)
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_public_menu_products(p_slug text)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  category_id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  promo_price numeric,
  image_url text,
  ingredients text[],
  is_available boolean,
  sort_order integer,
  is_featured boolean,
  is_bestseller boolean,
  filters text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.tenant_id, p.category_id, p.name, p.slug, p.description, 
    p.price, p.promo_price, p.image_url, p.ingredients, p.is_available, 
    p.sort_order, p.is_featured, p.is_bestseller, p.filters
  FROM products p
  JOIN tenants t ON t.id = p.tenant_id
  WHERE t.slug = p_slug
    AND t.subscription_status = 'active'
    AND p.is_available = true
  ORDER BY p.sort_order ASC;
END;
$$;

-- ==============================================================================
-- 6. FUNÇÃO RPC SECURITY DEFINER: CATEGORIAS (Com search_path blindado)
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_public_menu_categories(p_slug text)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  name text,
  slug text,
  sort_order integer,
  is_active boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.tenant_id, c.name, c.slug, c.sort_order, c.is_active
  FROM categories c
  JOIN tenants t ON t.id = c.tenant_id
  WHERE t.slug = p_slug
    AND t.subscription_status = 'active'
    AND c.is_active = true
  ORDER BY c.sort_order ASC;
END;
$$;

-- Conceder execução das RPCs públicas para a role anônima
GRANT EXECUTE ON FUNCTION get_public_menu_products(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_menu_categories(text) TO anon, authenticated;

-- ==============================================================================
-- 7. POLÍTICAS DE RLS PARA O PAINEL ADMIN (Role Authenticated + JWT Claim)
-- ==============================================================================

-- PRODUCTS (Admin CRUD)
CREATE POLICY "Admin manage own products"
ON products FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- CATEGORIES (Admin CRUD)
CREATE POLICY "Admin manage own categories"
ON categories FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- TENANTS (Admin CRUD)
CREATE POLICY "Admin manage own tenant"
ON tenants FOR ALL
TO authenticated
USING (id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ORDERS (Admin CRUD + Service Role)
CREATE POLICY "Admin manage orders"
ON orders FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- RESTAURANT_TABLES (Admin CRUD)
CREATE POLICY "Admin manage tables"
ON restaurant_tables FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ANALYTICS_EVENTS (Admin CRUD)
CREATE POLICY "Admin read analytics"
ON analytics_events FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
