'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { DataService } from '@/lib/supabase';
import { Tenant, Category, Product, FilterTag } from '@/types';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { FilterBadges } from '@/components/menu/FilterBadges';
import { SearchBar } from '@/components/menu/SearchBar';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductDetailModal } from '@/components/menu/ProductDetailModal';
import { WhatsAppCartDrawer } from '@/components/menu/WhatsAppCartDrawer';
import { QRCodeModal } from '@/components/menu/QRCodeModal';
import { TableBillModal } from '@/components/menu/TableBillModal';
import { TableOrderTracker } from '@/components/menu/TableOrderTracker';
import { PrivacyPolicyModal } from '@/components/menu/PrivacyPolicyModal';
import { useCart } from '@/context/CartContext';
import { QrCode, Sparkles, AlertCircle, Receipt, ShieldCheck } from 'lucide-react';

export default function PublicMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || 'calixto-burger';
  const mesaQuery = searchParams.get('mesa');

  const { setTableNumber } = useCart();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [selectedFilters, setSelectedFilters] = useState<FilterTag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (mesaQuery) {
      setTableNumber(mesaQuery);
    }
  }, [mesaQuery, setTableNumber]);

  useEffect(() => {
    async function loadData() {
      const t = await DataService.getTenantBySlug(slug);
      setTenant(t);
      if (t) {
        const cats = await DataService.getPublicCategoriesBySlug(slug);
        const prods = await DataService.getPublicProductsBySlug(slug);
        setCategories(cats);
        setProducts(prods);

        // Record page view analytics
        const eventType = mesaQuery ? 'qr_scan' : 'page_view';
        DataService.recordAnalyticsEvent(t.id, eventType, undefined, mesaQuery ? parseInt(mesaQuery, 10) : undefined);
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: t.id,
            eventType: eventType,
            details: mesaQuery ? `Leitura de QR Code na Mesa #${mesaQuery}` : 'Acesso direto ao cardápio',
          }),
        }).catch((e) => console.warn('Analytics API error:', e));
      }
    }
    loadData();
  }, [slug]);

  if (!tenant) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
            ✨
          </div>
          <p className="text-sm font-semibold">Carregando Cardápio Digital...</p>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredProducts = products.filter((product) => {
    // Category match
    if (activeCategoryId !== 'all' && product.category_id !== activeCategoryId) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(query);
      const matchDesc = product.description.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }
    // Filter tags match
    if (selectedFilters.length > 0) {
      const hasAllFilters = selectedFilters.every((f) => product.filters?.includes(f));
      if (!hasAllFilters) return false;
    }
    return true;
  });

  const toggleFilterTag = (fTag: FilterTag) => {
    setSelectedFilters((prev) =>
      prev.includes(fTag) ? prev.filter((t) => t !== fTag) : [...prev, fTag]
    );
  };

  const themeConfig = tenant.theme_config || { primary_color: '#B8860B', mode: 'dark', style: 'glass' };

  // Map preset backgrounds
  const PRESET_BG: Record<string, { primary: string; bgStart: string; bgEnd: string; isCream?: boolean }> = {
    emerald: { primary: '#10b981', bgStart: '#03180e', bgEnd: '#0b2d1c' },
    coffee: { primary: '#d97706', bgStart: '#170c08', bgEnd: '#2d170e' },
    cyber: { primary: '#a855f7', bgStart: '#0b0518', bgEnd: '#1e0a38' },
    sunset: { primary: '#f97316', bgStart: '#190704', bgEnd: '#330f08' },
    sapphire: { primary: '#06b6d4', bgStart: '#040f1a', bgEnd: '#0a2238' },
    cream: { primary: '#059669', bgStart: '#f7f4ef', bgEnd: '#eae2d6', isCream: true },
  };

  const preset = themeConfig.gradient_preset ? PRESET_BG[themeConfig.gradient_preset] : null;

  const primaryColor = preset?.primary || themeConfig.primary_color || '#B8860B';
  const mode = themeConfig.mode || 'dark';
  const isLight = mode === 'light' || (preset?.isCream ?? false);

  let bgStyle: React.CSSProperties = {};
  if (preset) {
    bgStyle = { background: `linear-gradient(135deg, ${preset.bgStart} 0%, ${preset.bgEnd} 100%)` };
  } else if (themeConfig.bg_gradient_start && themeConfig.bg_gradient_end) {
    bgStyle = { background: `linear-gradient(135deg, ${themeConfig.bg_gradient_start} 0%, ${themeConfig.bg_gradient_end} 100%)` };
  }

  return (
    <div
      style={bgStyle}
      className={`min-h-screen pb-32 font-sans transition-all duration-500 relative overflow-hidden ${
        isLight
          ? 'bg-zinc-100 text-zinc-900 selection:bg-emerald-500 selection:text-white light'
          : 'bg-zinc-950 text-white selection:bg-orange-500 selection:text-white'
      }`}
    >
      {/* Ambient Glow Orbs */}
      <div
        className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-all duration-700 z-0"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="fixed bottom-0 right-1/4 w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-15 transition-all duration-700 z-0"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="relative z-10">
        {/* Table Badge Header Notification if mesa query present */}
        {mesaQuery && (
          <div
            style={{ backgroundColor: primaryColor }}
            className="text-white text-xs font-bold py-2.5 px-4 shadow-md flex items-center justify-between gap-2 max-w-4xl mx-auto rounded-b-2xl flex-wrap"
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>Você está no Consumo Local - <strong>Mesa #{mesaQuery}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => setIsBillModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Pedir a Conta</span>
            </button>
          </div>
        )}

      {/* Header section */}
      <MenuHeader tenant={tenant} isLight={isLight} primaryColor={primaryColor} />

      {/* Realtime Table Order Tracker Widget */}
      {mesaQuery && (
        <TableOrderTracker tenantId={tenant.id} tableNumber={mesaQuery} primaryColor={primaryColor} />
      )}

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} isLight={isLight} />

      {/* Filter Badges */}
      <FilterBadges selectedFilters={selectedFilters} onToggleFilter={toggleFilterTag} isLight={isLight} />

      {/* Category Sticky Bar */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
        primaryColor={primaryColor}
        isLight={isLight}
      />

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 space-y-4">
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl border p-8 ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm' : 'glass-panel border-white/10 text-white'
          }`}>
            <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Nenhum prato encontrado</h3>
            <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Tente alterar os termos da busca ou remover os filtros aplicados.
            </p>
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={setSelectedProduct}
              primaryColor={primaryColor}
              isLight={isLight}
            />
          ))
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* WhatsApp Cart Drawer */}
      <WhatsAppCartDrawer
        tenantWhatsapp={tenant.whatsapp}
        tenantName={tenant.name}
        tenantId={tenant.id}
        storeCep={tenant.cep || '14800-000'}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        tenantSlug={tenant.slug}
        tenantName={tenant.name}
      />

      {/* Table Bill Request Modal */}
      {mesaQuery && (
        <TableBillModal
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
          tableNumber={mesaQuery}
          tenantName={tenant.name}
          tenantId={tenant.id}
          tenantWhatsapp={tenant.whatsapp}
        />
      )}

      {/* Privacy Policy Modal (LGPD — Art. 7º, V) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* LGPD Footer Link */}
      <div style={{ textAlign: 'center', padding: '1rem 0 2rem', opacity: 0.5 }}>
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'inherit' }}
        >
          <ShieldCheck size={12} />
          Política de Privacidade &amp; LGPD
        </button>
      </div>
      </div>
    </div>
  );
}
