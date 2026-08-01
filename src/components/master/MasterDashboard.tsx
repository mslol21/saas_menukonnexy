'use client';

import React, { useState } from 'react';
import { MOCK_TENANTS } from '@/lib/mock-data';
import { Tenant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Users, DollarSign, Store, Activity, Lock, Unlock, Calendar, CheckCircle2 } from 'lucide-react';

export const MasterDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);

  const toggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.subscription_status === 'active' ? 'suspended' : 'active';
          return { ...t, subscription_status: nextStatus };
        }
        return t;
      })
    );
  };

  const totalActive = tenants.filter((t) => t.subscription_status === 'active').length;
  const totalRevenue = totalActive * 49;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" /> Painel Master Super Admin
            </span>
            <h1 className="text-3xl font-black">Gestão Global da Plataforma Konnexy Menu</h1>
          </div>
          <Badge variant="primary" className="py-1 px-3 text-xs uppercase font-extrabold">
            Ambiente Master
          </Badge>
        </div>

        {/* Top SaaS Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Restaurantes Cadastrados</span>
              <Store className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-4xl font-black text-white">{tenants.length}</span>
            <span className="text-xs text-emerald-400 font-semibold block mt-1">● Todos os Tenants</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Assinaturas Ativas</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-4xl font-black text-white">{totalActive}</span>
            <span className="text-xs text-zinc-400 block mt-1">Garantia RLS no Supabase</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Faturamento Estimado (MRR)</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-4xl font-black text-emerald-400">R$ {totalRevenue.toLocaleString()},00</span>
            <span className="text-xs text-zinc-400 block mt-1">Recorrência mensal ativa</span>
          </div>
        </div>

        {/* Tenant Management Table */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Lista de Clientes / Restaurantes (Tenants)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-zinc-400">
                <tr>
                  <th className="p-4">Restaurante</th>
                  <th className="p-4">Link Exclusivo</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Status Assinatura</th>
                  <th className="p-4 text-right">Ações Master</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img src={t.logo_url} alt={t.name} className="w-9 h-9 rounded-xl object-cover border border-orange-500/50" />
                      <div>
                        <span>{t.name}</span>
                        <span className="text-xs text-zinc-500 block">{t.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-orange-400">/menu/{t.slug}</td>
                    <td className="p-4 uppercase text-xs font-bold">{t.subscription_plan}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        t.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {t.subscription_status === 'active' ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleStatus(t.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          t.subscription_status === 'active'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {t.subscription_status === 'active' ? 'Suspender Conta' : 'Ativar Conta'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
