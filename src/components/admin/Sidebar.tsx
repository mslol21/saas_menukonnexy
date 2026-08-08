'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Store, Layers, Package, QrCode, CreditCard, ExternalLink, LogOut, ChefHat, Ticket } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tenantSlug: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tenantSlug }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Métricas', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kitchen', label: 'Monitor da Cozinha (KDS)', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'coupons', label: 'Cupons & Entrega', icon: <Ticket className="w-4 h-4" /> },
    { id: 'profile', label: 'Dados do Restaurante', icon: <Store className="w-4 h-4" /> },
    { id: 'categories', label: 'Categorias', icon: <Layers className="w-4 h-4" /> },
    { id: 'products', label: 'Produtos & Pratos', icon: <Package className="w-4 h-4" /> },
    { id: 'qrcode', label: 'Studio QR Code', icon: <QrCode className="w-4 h-4" /> },
    { id: 'subscription', label: 'Minha Assinatura', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-64 glass-panel border-r border-white/10 p-6 flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] rounded-3xl font-sans">
      <div>
        {/* Official Konnexy Brand */}
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-amber-500/40 p-0.5 bg-zinc-900 shadow-md shadow-amber-500/10 shrink-0">
            <img src="/konnexy-logo.jpg" alt="Konnexy Menu Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-none tracking-tight">Painel Admin</h3>
            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block mt-1">Konnexy Menu</span>
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
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black shadow-lg shadow-amber-500/20'
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
          className="flex items-center justify-between p-3 rounded-xl glass-panel text-xs font-bold text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors"
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
