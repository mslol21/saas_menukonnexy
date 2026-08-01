'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_TENANTS } from '@/lib/mock-data';
import { Tenant, TenantThemeConfig } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck, Users, DollarSign, Store, Palette, Lock, CheckCircle2, Sun, Moon, Sparkles, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const MasterDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState<boolean>(true);
  const [selectedTenantForTheme, setSelectedTenantForTheme] = useState<Tenant | null>(null);
  const [themeConfig, setThemeConfig] = useState<TenantThemeConfig>({
    primary_color: '#FF5722',
    mode: 'dark',
    style: 'glass',
  });

  const loadAllTenants = async () => {
    setIsLoadingTenants(true);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          setTenants(data as Tenant[]);
          setIsLoadingTenants(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to load tenants from Supabase:', err);
      }
    }

    // Check localStorage for local tenant if no Supabase tenants found
    const savedLocal = typeof window !== 'undefined' ? localStorage.getItem('konnexy_user_tenant') : null;
    if (savedLocal) {
      const parsed = JSON.parse(savedLocal);
      const combined = [parsed, ...MOCK_TENANTS.filter((m) => m.id !== parsed.id)];
      setTenants(combined);
    } else {
      setTenants(MOCK_TENANTS);
    }
    setIsLoadingTenants(false);
  };

  useEffect(() => {
    loadAllTenants();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, subscription_status: nextStatus as any } : t))
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('tenants')
          .update({ subscription_status: nextStatus })
          .eq('id', id);
      } catch (e) {
        console.error('Failed to update status in Supabase:', e);
      }
    }
  };

  const handleOpenThemeModal = (tenant: Tenant) => {
    setSelectedTenantForTheme(tenant);
    setThemeConfig(tenant.theme_config || { primary_color: '#FF5722', mode: 'dark', style: 'glass' });
  };

  const handleSaveMasterTheme = async () => {
    if (!selectedTenantForTheme) return;

    const updatedTenant: Tenant = {
      ...selectedTenantForTheme,
      theme_config: themeConfig,
    };

    setTenants((prev) => prev.map((t) => (t.id === selectedTenantForTheme.id ? updatedTenant : t)));

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('konnexy_user_tenant');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id === updatedTenant.id) {
          localStorage.setItem('konnexy_user_tenant', JSON.stringify(updatedTenant));
        }
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('tenants')
          .update({ theme_config: themeConfig })
          .eq('id', selectedTenantForTheme.id);
      } catch (e) {
        console.error('Master theme sync error:', e);
      }
    }

    setSelectedTenantForTheme(null);
    alert(`Tema do restaurante "${updatedTenant.name}" atualizado com sucesso pelo Super Admin!`);
  };

  const totalActive = tenants.filter((t) => t.subscription_status === 'active').length;
  const totalRevenue = totalActive * 49.90;

  const colorOptions = [
    { label: 'Laranja Konnexy', hex: '#FF5722' },
    { label: 'Vermelho Ruby', hex: '#E11D48' },
    { label: 'Verde Esmeralda', hex: '#10B981' },
    { label: 'Azul Elétrico', hex: '#3B82F6' },
    { label: 'Roxo Neon', hex: '#8B5CF6' },
    { label: 'Âmbar Dourado', hex: '#F59E0B' },
    { label: 'Rosa Choque', hex: '#EC4899' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" /> Painel Master Super Admin
            </span>
            <h1 className="text-3xl font-black">Gestão Global & Personalização da Plataforma</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllTenants}
              className="p-2.5 rounded-xl glass-panel text-zinc-300 hover:text-white border border-white/10 flex items-center gap-2 text-xs font-bold"
              title="Atualizar Dados do Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingTenants ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <Badge variant="primary" className="py-1.5 px-3 text-xs uppercase font-extrabold">
              Ambiente Exclusivo Master
            </Badge>
          </div>
        </div>

        {/* Top SaaS Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Restaurantes Cadastrados</span>
              <Store className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-4xl font-black text-white">{tenants.length}</span>
            <span className="text-xs text-emerald-400 font-semibold block mt-1">● Conectado ao Supabase</span>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Clientes Cadastrados no Banco de Dados</h3>
          </div>

          <div className="overflow-x-auto">
            {isLoadingTenants ? (
              <div className="text-center py-12 text-sm text-zinc-400 animate-pulse">
                Carregando restaurantes do banco de dados...
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12 text-sm text-zinc-400">
                Nenhum restaurante cadastrado no momento.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-bold text-zinc-400">
                  <tr>
                    <th className="p-4">Restaurante</th>
                    <th className="p-4">Link Exclusivo</th>
                    <th className="p-4">Cor Primária do Layout</th>
                    <th className="p-4">Status Assinatura</th>
                    <th className="p-4 text-right">Ações de Controle Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <img src={t.logo_url} alt={t.name} className="w-9 h-9 rounded-xl object-cover border border-orange-500/50" />
                        <div>
                          <span>{t.name}</span>
                          <span className="text-xs text-zinc-500 block">{t.phone || '(11) 99999-8888'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-orange-400">/menu/{t.slug}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-md"
                            style={{ backgroundColor: t.theme_config?.primary_color || '#FF5722' }}
                          />
                          <span className="text-xs font-semibold text-zinc-300">
                            {t.theme_config?.primary_color || '#FF5722'} ({t.theme_config?.mode || 'dark'})
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          t.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {t.subscription_status === 'active' ? 'Ativo' : 'Suspenso'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenThemeModal(t)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Palette className="w-3.5 h-3.5" /> Personalizar Layout
                        </button>

                        <button
                          onClick={() => toggleStatus(t.id, t.subscription_status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            t.subscription_status === 'active'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                        >
                          {t.subscription_status === 'active' ? 'Suspender' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Master Theme Customizer Modal */}
      <Modal
        isOpen={!!selectedTenantForTheme}
        onClose={() => setSelectedTenantForTheme(null)}
        title={`🎨 Personalização de Layout Master: ${selectedTenantForTheme?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-6">
          <p className="text-xs text-zinc-300">
            Esta função é exclusiva do **Super Admin Master**. Selecione a paleta de cores primária, modo de exibição e estilo visual para a página pública deste usuário.
          </p>

          {/* Primary Color Picker */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Cor de Destaque Primária</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setThemeConfig({ ...themeConfig, primary_color: c.hex })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    themeConfig.primary_color === c.hex ? 'bg-white/10 border-orange-400 shadow-lg scale-105' : 'glass-panel border-white/10 text-zinc-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full shrink-0 shadow-md" style={{ backgroundColor: c.hex }} />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Modo de Exibição Padrão</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setThemeConfig({ ...themeConfig, mode: 'dark' })}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  themeConfig.mode === 'dark' ? 'bg-orange-500 text-white border-orange-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode (Escuro Premium)
              </button>
              <button
                type="button"
                onClick={() => setThemeConfig({ ...themeConfig, mode: 'light' })}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  themeConfig.mode === 'light' ? 'bg-orange-500 text-white border-orange-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode (Claro Minimalista)
              </button>
            </div>
          </div>

          {/* Visual Style Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Estilo Visual da Interface</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeConfig({ ...themeConfig, style: 'glass' })}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  themeConfig.style === 'glass' ? 'bg-orange-500 text-white border-orange-400' : 'glass-panel text-zinc-400 border-white/10'
                }`}
              >
                Glassmorphism
              </button>
              <button
                type="button"
                onClick={() => setThemeConfig({ ...themeConfig, style: 'minimal' })}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  themeConfig.style === 'minimal' ? 'bg-orange-500 text-white border-orange-400' : 'glass-panel text-zinc-400 border-white/10'
                }`}
              >
                Minimalista
              </button>
              <button
                type="button"
                onClick={() => setThemeConfig({ ...themeConfig, style: 'vibrant' })}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  themeConfig.style === 'vibrant' ? 'bg-orange-500 text-white border-orange-400' : 'glass-panel text-zinc-400 border-white/10'
                }`}
              >
                Vibrante
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setSelectedTenantForTheme(null)}>
              Cancelar
            </Button>
            <Button variant="primary" type="button" onClick={handleSaveMasterTheme}>
              Salvar Alterações de Tema
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
