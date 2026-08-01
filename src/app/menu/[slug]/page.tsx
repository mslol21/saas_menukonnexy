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
import { useCart } from '@/context/CartContext';
import { QrCode, Sparkles, AlertCircle } from 'lucide-react';

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
        const cats = await DataService.getCategoriesByTenant(t.id);
        const prods = await DataService.getProductsByTenant(t.id);
        setCategories(cats);
        setProducts(prods);

        // Record page view analytics
        DataService.recordAnalyticsEvent(t.id, 'page_view');
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32 font-sans selection:bg-orange-500 selection:text-white">
      {/* Table Badge Header Notification if mesa query present */}
      {mesaQuery && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold text-center py-2 px-4 shadow-md flex items-center justify-center gap-2">
          <QrCode className="w-4 h-4" />
          <span>Você está no Consumo Local - Mesa #{mesaQuery}</span>
        </div>
      )}

      {/* Header section */}
      <MenuHeader tenant={tenant} />

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Filter Badges */}
      <FilterBadges selectedFilters={selectedFilters} onToggleFilter={toggleFilterTag} />

      {/* Category Sticky Bar */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 p-8">
            <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Nenhum prato encontrado</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Tente alterar os termos da busca ou remover os filtros aplicados.
            </p>
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={setSelectedProduct}
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
      <WhatsAppCartDrawer tenantWhatsapp={tenant.whatsapp} tenantName={tenant.name} />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        tenantSlug={tenant.slug}
        tenantName={tenant.name}
      />
    </div>
  );
}
