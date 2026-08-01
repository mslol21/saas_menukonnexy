'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/mock-data';
import { Tenant, Category, Product } from '@/types';
import { Sidebar } from '@/components/admin/Sidebar';
import { OverviewMetrics } from '@/components/admin/OverviewMetrics';
import { RestaurantProfileForm } from '@/components/admin/RestaurantProfileForm';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { QRCodeStudio } from '@/components/admin/QRCodeStudio';
import { SubscriptionCard } from '@/components/admin/SubscriptionCard';
import { DataService } from '@/lib/supabase';

export default function TenantAdminPage() {
  const { userTenant, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    if (userTenant) {
      setTenant(userTenant);
      async function loadTenantData() {
        if (userTenant?.id) {
          const cats = await DataService.getCategoriesByTenant(userTenant.id);
          const prods = await DataService.getProductsByTenant(userTenant.id);
          if (cats.length > 0) setCategories(cats);
          if (prods.length > 0) setProducts(prods);
        }
      }
      loadTenantData();
    }
  }, [userTenant]);

  if (isLoading || !tenant) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="animate-pulse text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            🛡️
          </div>
          <p className="text-sm font-semibold">Carregando e Verificando Permissões de Segurança...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500 selection:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tenantSlug={tenant.slug} />

        {/* Content Area (Strictly scoped to userTenant) */}
        <main className="flex-1 w-full glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 min-h-[calc(100vh-80px)]">
          {activeTab === 'dashboard' && <OverviewMetrics />}
          {activeTab === 'profile' && <RestaurantProfileForm tenant={tenant} onSave={setTenant} />}
          {activeTab === 'categories' && <CategoriesManager categories={categories} onUpdateCategories={setCategories} />}
          {activeTab === 'products' && <ProductsManager products={products} categories={categories} onUpdateProducts={setProducts} />}
          {activeTab === 'qrcode' && <QRCodeStudio tenantSlug={tenant.slug} tenantName={tenant.name} />}
          {activeTab === 'subscription' && <SubscriptionCard tenant={tenant} />}
        </main>
      </div>
    </div>
  );
}
