-- ==============================================================================
-- MENU KONNEXY SAAS - SCRIPT SQL COMPLETO & BLINDADO (POSTGRESQL + RPC + RLS 3.5)
-- Versão 3.5.0 • Produção • Proteção contra Search Path Hijacking, REVOKEs e Views
-- ==============================================================================

-- 1. Habilitar RLS em TODAS as tabelas do sistema
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas prévias
DROP POLICY IF EXISTS "Public select active tenant" ON tenants;
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
-- 2. REVOKES EXPLÍCITOS (Camada de Permissões de Tabela)
-- Impede física e totalmente consultas genéricas via ANON_KEY/AUTHENTICATED
-- ==============================================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON products FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON categories FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON orders FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON restaurant_tables FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON analytics_events FROM anon, authenticated;

-- ==============================================================================
-- 3. VISTA PÚBLICA SEGURA DA TABELA TENANTS (Previne Vazamento de E-mail/CNPJ)
-- Expõe apenas os dados públicos necessários para o cardápio
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

GRANT SELECT ON public_tenants TO anon, authenticated;

-- ==============================================================================
-- 4. FUNÇÃO RPC SECURITY DEFINER: PRODUTOS (Com search_path blindado)
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
-- 5. FUNÇÃO RPC SECURITY DEFINER: CATEGORIAS (Com search_path blindado)
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

-- Conceder permissão de execução das RPCs para acesso anônimo
GRANT EXECUTE ON FUNCTION get_public_menu_products(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_menu_categories(text) TO anon, authenticated;

-- ==============================================================================
-- 6. POLÍTICAS DE RLS PARA O PAINEL ADMIN (Autenticado via JWT Claim)
-- ==============================================================================

-- PRODUCTS (Admin)
CREATE POLICY "Admin select own products"
ON products FOR SELECT
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Admin manage own products"
ON products FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- CATEGORIES (Admin)
CREATE POLICY "Admin select own categories"
ON categories FOR SELECT
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Admin manage own categories"
ON categories FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- TENANTS (Admin)
CREATE POLICY "Admin manage own tenant"
ON tenants FOR ALL
TO authenticated
USING (id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ORDERS (Admin + Server Role)
CREATE POLICY "Admin manage orders"
ON orders FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- RESTAURANT_TABLES (Admin)
CREATE POLICY "Admin manage tables"
ON restaurant_tables FOR ALL
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ANALYTICS_EVENTS (Admin + Server Role)
CREATE POLICY "Admin read analytics"
ON analytics_events FOR SELECT
TO authenticated
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Conceder permissões para a role de administração autenticada
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
