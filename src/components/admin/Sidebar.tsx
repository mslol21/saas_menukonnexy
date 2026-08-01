'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, LayoutDashboard, Store, Layers, Package, QrCode, CreditCard, ExternalLink, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tenantSlug: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tenantSlug }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Métricas', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profile', label: 'Dados do Restaurante', icon: <Store className="w-4 h-4" /> },
    { id: 'categories', label: 'Categorias', icon: <Layers className="w-4 h-4" /> },
    { id: 'products', label: 'Produtos & Pratos', icon: <Package className="w-4 h-4" /> },
    { id: 'qrcode', label: 'Studio QR Code', icon: <QrCode className="w-4 h-4" /> },
    { id: 'subscription', label: 'Minha Assinatura', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-64 glass-panel border-r border-white/10 p-6 flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] rounded-3xl">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2.5 pb-6 mb-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white leading-none">Painel Admin</h3>
            <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">Konnexy Menu</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom External Link */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <Link
          href={`/menu/${tenantSlug}`}
          target="_blank"
          className="flex items-center justify-between p-3 rounded-xl glass-panel text-xs font-bold text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-colors"
        >
          <span>Ver Cardápio Público</span>
          <ExternalLink className="w-4 h-4" />
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair para a Landing
        </Link>
      </div>
    </aside>
  );
};
