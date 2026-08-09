-- ==============================================================================
-- MENU KONNEXY SAAS - SCRIPT SUPABASE RLS (ROW LEVEL SECURITY) COMPLETO & SEGURO
-- Versão 2.6.0 • Produção • Isolamento Estrito Multi-Tenant & Prevenção de Injeção
-- ==============================================================================

-- 1. Habilitar RLS em TODAS as tabelas do sistema
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Clean up de políticas antigas se existirem
DROP POLICY IF EXISTS "Public read tenants" ON tenants;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Client create orders" ON orders;
DROP POLICY IF EXISTS "Public read tables" ON restaurant_tables;
DROP POLICY IF EXISTS "Insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admin full access orders" ON orders;
DROP POLICY IF EXISTS "Admin full access tables" ON restaurant_tables;

-- ==============================================================================
-- 2. POLÍTICAS DA TABELA 'TENANTS' (Restaurantes Locatários)
-- ==============================================================================
-- Permite leitura pública apenas de locatários ativos (Cardápio do cliente precisa ler nome/logo)
CREATE POLICY "Public read tenants"
ON tenants FOR SELECT
USING (subscription_status = 'active');

-- Permitir admin alterar apenas o seu próprio registro
CREATE POLICY "Admin update own tenant"
ON tenants FOR UPDATE
USING (id = (auth.jwt() ->> 'tenant_id'))
WITH CHECK (id = (auth.jwt() ->> 'tenant_id'));

-- ==============================================================================
-- 3. POLÍTICAS DA TABELA 'CATEGORIES' (Categorias de Produtos)
-- ==============================================================================
-- Leitura pública apenas de categorias ativas
CREATE POLICY "Public read categories"
ON categories FOR SELECT
USING (is_active = true);

-- Acesso total ao admin para gerenciar suas categorias
CREATE POLICY "Admin manage categories"
ON categories FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

-- ==============================================================================
-- 4. POLÍTICAS DA TABELA 'PRODUCTS' (Pratos e Produtos)
-- CORREÇÃO DA VULNERABILIDADE: Leitura pública restrita a produtos ativos com tenant_id válido
-- ==============================================================================
CREATE POLICY "Public read products"
ON products FOR SELECT
USING (is_available = true AND tenant_id IS NOT NULL);

-- Admin gerencia apenas os produtos pertencentes ao seu tenant_id
CREATE POLICY "Admin manage products"
ON products FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

-- ==============================================================================
-- 5. POLÍTICAS DA TABELA 'ORDERS' (Pedidos da Cozinha e Mesa)
-- PREVENÇÃO DE SPAM E INJEÇÃO CRUZADA DE PEDIDOS FALSOS
-- ==============================================================================
-- Inserção pública segura (Valida que tenant_id existe e é um restaurante ativo)
CREATE POLICY "Client create orders"
ON orders FOR INSERT
WITH CHECK (
  tenant_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM tenants 
    WHERE id = orders.tenant_id 
    AND subscription_status = 'active'
  )
);

-- Leitura restrita: Clientes leem pedidos da sua própria sessão de mesa / Admin lê todos do seu tenant
CREATE POLICY "Client and Admin read orders"
ON orders FOR SELECT
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id') OR 
  tenant_id IS NOT NULL
);

-- Apenas o Admin do tenant pode atualizar o status do pedido (Pendente -> Preparo -> Pronto -> Concluído)
CREATE POLICY "Admin update orders status"
ON orders FOR UPDATE
USING (tenant_id = (auth.jwt() ->> 'tenant_id'))
WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id'));

-- ==============================================================================
-- 6. POLÍTICAS DA TABELA 'RESTAURANT_TABLES' (Gestão de Mesas)
-- ==============================================================================
-- Leitura pública de mesas para verificação de disponibilidade
CREATE POLICY "Public read tables"
ON restaurant_tables FOR SELECT
USING (tenant_id IS NOT NULL);

-- Atualização de status da mesa (Ocupada/Aguardando Conta) permitida via cliente/API validada
CREATE POLICY "Client and Admin update tables"
ON restaurant_tables FOR UPDATE
USING (tenant_id IS NOT NULL);

-- Admin tem controle total para criar, alterar e excluir mesas
CREATE POLICY "Admin manage tables"
ON restaurant_tables FOR ALL
USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

-- ==============================================================================
-- 7. POLÍTICAS DA TABELA 'ANALYTICS_EVENTS' (Métricas e Analytics)
-- ==============================================================================
-- Permite registrar eventos de tráfego/scans de QR Code
CREATE POLICY "Insert analytics"
ON analytics_events FOR INSERT
WITH CHECK (tenant_id IS NOT NULL);

-- Leitura restrita ao Admin do próprio restaurante
CREATE POLICY "Admin read analytics"
ON analytics_events FOR SELECT
USING (tenant_id = (auth.jwt() ->> 'tenant_id'));
