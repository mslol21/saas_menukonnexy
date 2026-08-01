'use client';

import React from 'react';
import { Eye, QrCode, MessageSquare, TrendingUp, Sparkles, Clock, Flame } from 'lucide-react';
import { MOCK_ANALYTICS } from '@/lib/mock-data';

export const OverviewMetrics: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Banner Welcome */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4" /> Visão Geral em Tempo Real
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Desempenho do Seu Cardápio</h2>
          <p className="text-sm text-zinc-300 mt-1 max-w-xl">
            Acompanhe o engajamento dos seus clientes, acessos diretos e conversão de pedidos para o WhatsApp.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">Visualizações</span>
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{MOCK_ANALYTICS.total_views.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% esta semana
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">QR Code Scans</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{MOCK_ANALYTICS.qr_scans.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +8.5% esta semana
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">Cliques WhatsApp</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{MOCK_ANALYTICS.whatsapp_clicks.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +21.4% esta semana
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">Taxa de Conversão</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">12.0%</span>
            <span className="text-xs text-zinc-400 block mt-1">Visitas convertidas em pedido</span>
          </div>
        </div>
      </div>

      {/* Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Pratos Mais Visualizados
          </h3>
          <div className="space-y-4">
            {MOCK_ANALYTICS.top_products.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-2xl glass-panel border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-extrabold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <img src={prod.image_url} alt={prod.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                    <span className="text-xs text-zinc-400">{prod.views.toLocaleString()} acessos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> Atividade Recente em Tempo Real
          </h3>
          <div className="space-y-3">
            {MOCK_ANALYTICS.recent_activity.map((act, idx) => (
              <div key={idx} className="p-3 rounded-2xl glass-panel border border-white/5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white block mb-0.5">{act.details}</span>
                  <span className="text-zinc-500">{act.time}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 text-[10px] uppercase font-semibold">
                  {act.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
