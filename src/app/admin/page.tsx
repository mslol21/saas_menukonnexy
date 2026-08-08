'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Category, Product } from '@/types';
import { Sidebar } from '@/components/admin/Sidebar';
import { OverviewMetrics } from '@/components/admin/OverviewMetrics';
import { RestaurantProfileForm } from '@/components/admin/RestaurantProfileForm';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { QRCodeStudio } from '@/components/admin/QRCodeStudio';
import { SubscriptionCard } from '@/components/admin/SubscriptionCard';
import { CouponsManager } from '@/components/admin/CouponsManager';
import { KitchenMonitor } from '@/components/admin/KitchenMonitor';
import { DataService } from '@/lib/supabase';

export default function TenantAdminPage() {
  const { userTenant, isLoading, updateUserTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (userTenant && userTenant.id) {
      const tenantId = userTenant.id;
      async function loadTenantData() {
        const cats = await DataService.getCategoriesByTenant(tenantId);
        const prods = await DataService.getProductsByTenant(tenantId);
        setCategories(cats);
        setProducts(prods);
      }
      loadTenantData();
    }
  }, [userTenant]);

  const handleUpdateCategories = async (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    if (userTenant?.id) {
      await DataService.saveCategories(userTenant.id, updatedCategories);
    }
  };

  const handleUpdateProducts = async (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    if (userTenant?.id) {
      await DataService.saveProducts(userTenant.id, updatedProducts);
    }
  };

  if (isLoading || !userTenant) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="animate-pulse text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            🛡️
          </div>
          <p className="text-sm font-semibold">Carregando Seu Restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tenantSlug={userTenant.slug} />

        {/* Content Area (Scoped strictly to logged in user tenant) */}
        <main className="flex-1 w-full glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 min-h-[calc(100vh-80px)]">
          {activeTab === 'dashboard' && <OverviewMetrics tenantId={userTenant.id} />}
          {activeTab === 'kitchen' && <KitchenMonitor tenantId={userTenant.id} />}
          {activeTab === 'coupons' && <CouponsManager tenantId={userTenant.id} />}
          {activeTab === 'profile' && <RestaurantProfileForm tenant={userTenant} onSave={updateUserTenant} />}
          {activeTab === 'categories' && <CategoriesManager categories={categories} onUpdateCategories={handleUpdateCategories} />}
          {activeTab === 'products' && <ProductsManager products={products} categories={categories} onUpdateProducts={handleUpdateProducts} />}
          {activeTab === 'qrcode' && <QRCodeStudio tenantSlug={userTenant.slug} tenantName={userTenant.name} />}
          {activeTab === 'subscription' && <SubscriptionCard tenant={userTenant} />}
        </main>
      </div>
    </div>
  );
}
