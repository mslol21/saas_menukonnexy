-- ========================================================
-- KONNEXY MENU - SCRIPT DE POPOVOAMENTO / SEED DATA
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. SEED TENANTS (RESTAURANTES DE EXEMPLO)
INSERT INTO tenants (id, name, slug, logo_url, banner_url, description, phone, whatsapp, instagram, address, opening_hours, subscription_status, subscription_plan)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Calixto Burger & Grill',
  'calixto-burger',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=500&fit=crop',
  'Hamburgueria gourmet com carnes nobres grelhadas na brasa, molhos especiais artesanais e milkshakes supremos.',
  '(11) 98888-7777',
  '5511988887777',
  '@calixtoburger',
  'Av. Paulista, 1500 - Jardins, São Paulo - SP',
  '{"mon_fri": "11:30 - 23:00", "sat_sun": "12:00 - 01:00"}'::jsonb,
  'active',
  'annual'
) ON CONFLICT (slug) DO NOTHING;

-- 2. SEED CATEGORIAS
INSERT INTO categories (id, tenant_id, name, slug, sort_order, is_active)
VALUES 
(
  'b2222222-2222-2222-2222-222222222221',
  'a1111111-1111-1111-1111-111111111111',
  '🔥 Mais Vendidos',
  'mais-vendidos',
  1,
  true
),
(
  'b2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
  '🍔 Burgers Grelhados',
  'burgers-grelhados',
  2,
  true
),
(
  'b2222222-2222-2222-2222-222222222223',
  'a1111111-1111-1111-1111-111111111111',
  '🍟 Porções & Acompanhamentos',
  'porcoes',
  3,
  true
),
(
  'b2222222-2222-2222-2222-222222222224',
  'a1111111-1111-1111-1111-111111111111',
  '🥤 Bebidas & Shakes',
  'bebidas',
  4,
  true
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- 3. SEED PRODUTOS
INSERT INTO products (id, tenant_id, category_id, name, slug, description, price, promo_price, image_url, gallery, ingredients, weight, calories, prep_time_min, serves, is_available, sort_order, is_featured, is_bestseller, is_promo, filters)
VALUES 
(
  'c3333333-3333-3333-3333-333333333331',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222221',
  'Konnexy Supreme Bacon Burger',
  'konnexy-supreme-bacon-burger',
  'Burger de 180g de Blend Angus grelhado no fogo, triplo queijo cheddar fatiado, bacon artesanal super crocante, cebola caramelizada no whiskey e molho especial em pão brioche amanteigado.',
  42.90,
  36.90,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&fit=crop'],
  ARRAY['Blend Angus 180g', 'Bacon defumado', 'Triple Cheddar', 'Cebola caramelizada', 'Molho secreto', 'Pão Brioche'],
  '380g',
  780,
  15,
  1,
  true,
  1,
  true,
  true,
  true,
  ARRAY['artesanal', 'premium']
),
(
  'c3333333-3333-3333-3333-333333333332',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'Smash Double Trufado',
  'smash-double-trufado',
  'Dois discos de smash burger 90g com crosta bem selada, queijo emmental derretido, maionese trufada e picles artesanal.',
  38.00,
  NULL,
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&fit=crop'],
  ARRAY['2x Smash 90g', 'Queijo Emmental', 'Maionese de trufas', 'Picles da casa'],
  '300g',
  640,
  12,
  1,
  true,
  2,
  false,
  true,
  false,
  ARRAY['artesanal', 'premium']
),
(
  'c3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222223',
  'Batata Rustica Trufada com Parmesão',
  'batata-rustica-trufada',
  'Batatas cortadas à mão com casca, fritas na hora, aromatizadas com azeite de trufas brancas e cobertas com queijo parmesão ralado e alecrim fresco.',
  28.90,
  24.90,
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&fit=crop'],
  ARRAY['Batatas Asterix', 'Azeite de trufa', 'Parmesão 24 meses', 'Alecrim fresco'],
  '400g',
  520,
  10,
  2,
  true,
  1,
  false,
  true,
  true,
  ARRAY['sem_gluten', 'artesanal']
) ON CONFLICT (tenant_id, slug) DO NOTHING;
