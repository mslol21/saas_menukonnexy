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
    { id: 'dashboard', label: 'Visão geral', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kitchen', label: 'Pedidos na cozinha', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'coupons', label: 'Cupons & Entrega', icon: <Ticket className="w-4 h-4" /> },
    { id: 'profile', label: 'Dados do Restaurante', icon: <Store className="w-4 h-4" /> },
    { id: 'categories', label: 'Categorias', icon: <Layers className="w-4 h-4" /> },
    { id: 'products', label: 'Produtos & Pratos', icon: <Package className="w-4 h-4" /> },
    { id: 'qrcode', label: 'Mesas e QR Code', icon: <QrCode className="w-4 h-4" /> },
    { id: 'subscription', label: 'Minha Assinatura', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-64 glass-panel border-r border-white/10 p-4 lg:p-5 flex flex-col justify-between shrink-0 lg:min-h-[calc(100dvh-64px)] lg:sticky lg:top-6 rounded-3xl font-sans">
      <div>
        {/* Official Konnexy Brand */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-cyan-500/40 p-0.5 bg-zinc-900 shadow-md shadow-cyan-500/10 shrink-0">
            <img src="/konnexy-logo.jpg" alt="Konnexy Menu Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-none tracking-tight">Painel Admin</h3>
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block mt-1">Konnexy Menu</span>
          </div>
        </div>

        {/* Navigation Items */}
        <label htmlFor="admin-section" className="block lg:hidden text-xs text-zinc-400 mb-2">Ir para</label>
        <select id="admin-section" value={activeTab} onChange={e=>setActiveTab(e.target.value)} className="lg:hidden w-full rounded-xl border border-cyan-500/40 bg-zinc-900 px-3 py-3 text-sm mb-3">{menuItems.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select>
        <nav aria-label="Painel do restaurante" className="hidden lg:block space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              aria-current={activeTab === item.id ? "page" : undefined}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
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
      <div className="pt-3 lg:pt-6 border-t border-white/10 space-y-3">
        <Link
          href={`/menu/${tenantSlug}`}
          target="_blank"
          className="flex items-center justify-between p-3 rounded-xl glass-panel text-xs font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
        >
          <span>Ver Cardápio Público</span>
          <ExternalLink className="w-4 h-4" />
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Voltar ao site
        </Link>
      </div>
    </aside>
  );
};
