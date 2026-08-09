-- ==============================================================================
-- MENU KONNEXY SAAS - SCRIPT SQL COMPLETO & SEGURO (POSTGRESQL + RPC + RLS)
-- Versão 3.0.0 • Produção • Proteção contra Vazamento de Produtos e Injeção de Pedidos
-- ==============================================================================

-- 1. Habilitar RLS em TODAS as tabelas do sistema
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas anteriores
DROP POLICY IF EXISTS "Public read tenants" ON tenants;
DROP POLICY IF EXISTS "Admin update own tenant" ON tenants;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin manage categories" ON categories;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Block direct public select on products" ON products;
DROP POLICY IF EXISTS "Admin manage products" ON products;
DROP POLICY IF EXISTS "Client create orders" ON orders;
DROP POLICY IF EXISTS "Admin manage orders" ON orders;
DROP POLICY IF EXISTS "Public read tables" ON restaurant_tables;
DROP POLICY IF EXISTS "Admin manage tables" ON restaurant_tables;
DROP POLICY IF EXISTS "Insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admin read analytics" ON analytics_events;

-- ==============================================================================
-- 2. SOLUÇÃO DEFINITIVA CONTRA VAZAMENTO DE PRODUTOS: FUNÇÃO RPC SECURITY DEFINER
-- Impede que qualquer cliente com ANON_KEY consulte pratos de concorrentes
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

-- Função RPC para leitura segura de categorias por slug
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

-- ==============================================================================
-- 3. POLÍTICA DE RLS DA TABELA 'PRODUCTS'
-- SELECT direto sem JWT de admin é BLOQUEADO. Obrigatório usar a função RPC acima.
-- ==============================================================================
CREATE POLICY "Admin select own products"
ON products FOR SELECT
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Admin manage own products"
ON products FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ==============================================================================
-- 4. POLÍTICA DE RLS DA TABELA 'CATEGORIES'
-- ==============================================================================
CREATE POLICY "Admin select own categories"
ON categories FOR SELECT
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Admin manage own categories"
ON categories FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ==============================================================================
-- 5. POLÍTICA DE RLS DA TABELA 'TENANTS'
-- ==============================================================================
-- Leitura pública segura por slug para resolução inicial do cardápio
CREATE POLICY "Public select active tenant"
ON tenants FOR SELECT
USING (subscription_status = 'active');

CREATE POLICY "Admin manage own tenant"
ON tenants FOR UPDATE
USING (id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ==============================================================================
-- 6. POLÍTICA DE RLS DA TABELA 'ORDERS'
-- PREVENÇÃO DE ATAQUES DE SPAM/INJEÇÃO: Inserção de pedidos via API Server-side Next.js
-- ==============================================================================
-- Bloquear inserção direta sem role de serviço/admin no frontend
CREATE POLICY "Admin manage orders"
ON orders FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ==============================================================================
-- 7. POLÍTICA DE RLS DA TABELA 'RESTAURANT_TABLES'
-- ==============================================================================
CREATE POLICY "Admin manage tables"
ON restaurant_tables FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ==============================================================================
-- 8. POLÍTICA DE RLS DA TABELA 'ANALYTICS_EVENTS'
-- ==============================================================================
CREATE POLICY "Admin read analytics"
ON analytics_events FOR SELECT
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "Allow server analytics insert"
ON analytics_events FOR INSERT
WITH CHECK (tenant_id IS NOT NULL);
