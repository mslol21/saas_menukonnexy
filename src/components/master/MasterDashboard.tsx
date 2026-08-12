'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_TENANTS } from '@/lib/mock-data';
import { Tenant, TenantThemeConfig, FilterTag } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck, Users, DollarSign, Store, Palette, Lock, CheckCircle2, Sun, Moon, Sparkles, RefreshCw, FolderPlus, Layers, Package, Trash2, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured, DataService } from '@/lib/supabase';
import { SECTOR_TEMPLATES, SectorTemplate } from '@/lib/templates';

export const MasterDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState<boolean>(true);
  const [selectedTenantForTheme, setSelectedTenantForTheme] = useState<Tenant | null>(null);
  const [selectedTenantForTemplate, setSelectedTenantForTemplate] = useState<Tenant | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const handleDeleteTenant = async (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setConfirmDeleteId(null);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').delete().eq('tenant_id', id);
        await supabase.from('restaurant_tables').delete().eq('tenant_id', id);
        await supabase.from('analytics_events').delete().eq('tenant_id', id);
        await supabase.from('products').delete().eq('tenant_id', id);
        await supabase.from('categories').delete().eq('tenant_id', id);
        await supabase.from('tenants').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete tenant from Supabase:', e);
      }
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('konnexy_user_tenant');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.id === id) localStorage.removeItem('konnexy_user_tenant');
        } catch {}
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
    await DataService.saveTenant(updatedTenant);

    setSelectedTenantForTheme(null);
    alert(`Tema do restaurante "${updatedTenant.name}" atualizado com sucesso pelo Super Admin!`);
  };

  const handleApplySectorTemplate = async (template: SectorTemplate) => {
    if (!selectedTenantForTemplate) return;

    const tenantId = selectedTenantForTemplate.id;
    const updatedTenant: Tenant = {
      ...selectedTenantForTemplate,
      logo_url: template.defaultLogo,
      banner_url: template.defaultBanner,
      theme_config: template.theme,
    };

    setTenants((prev) => prev.map((t) => (t.id === tenantId ? updatedTenant : t)));
    await DataService.saveTenant(updatedTenant);

    // Prepare template categories & products
    const templateCats = template.categories.map((c, i) => ({
      id: `cat-${template.id}-${i}`,
      tenant_id: tenantId,
      name: c.name,
      slug: c.slug,
      sort_order: c.sort_order,
      is_active: true,
    }));

    const templateProds = template.products.map((p, i) => ({
      id: `prod-${template.id}-${i}`,
      tenant_id: tenantId,
      category_id: `cat-${template.id}-${templateCats.find((c) => c.slug === p.category_slug)?.sort_order || 0}`,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      promo_price: p.promo_price,
      image_url: p.image_url,
      ingredients: p.ingredients || [],
      is_available: true,
      sort_order: i + 1,
      is_featured: p.is_featured || false,
      is_bestseller: p.is_bestseller || false,
      filters: (p.filters || []) as FilterTag[],
    }));

    await DataService.saveCategories(tenantId, templateCats);
    await DataService.saveProducts(tenantId, templateProds);

    setSelectedTenantForTemplate(null);
    alert(`Template de nicho "${template.name}" aplicado com sucesso para o restaurante "${updatedTenant.name}" pelo Super Admin!`);
  };

  const totalActive = tenants.filter((t) => t.subscription_status === 'active').length;
  const totalRevenue = totalActive * 59.90;

  const colorOptions = [
    { label: 'Laranja Konnexy', hex: '#FF5722' },
    { label: 'Vermelho Ruby', hex: '#E11D48' },
    { label: 'Ciano Elétrico', hex: '#06B6D4' },
    { label: 'Dourado Nobre', hex: '#B8860B' },
    { label: 'Roxo Açaí', hex: '#8B5CF6' },
    { label: 'Verde Esmeralda', hex: '#10B981' },
    { label: 'Âmbar Boteco', hex: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" /> Painel Master Super Admin
            </span>
            <h1 className="text-3xl font-black">Gestão Global & Personalização de Cardápios</h1>
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
            <Badge variant="primary" className="py-1.5 px-3 text-xs uppercase font-extrabold bg-amber-500 text-zinc-950 border-amber-400">
              Ambiente Exclusivo Master
            </Badge>
          </div>
        </div>

        {/* Top SaaS Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Restaurantes Cadastrados</span>
              <Store className="w-5 h-5 text-amber-400" />
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
            <span className="text-4xl font-black text-emerald-400">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="text-xs text-zinc-400 block mt-1">Recorrência mensal ativa</span>
          </div>
        </div>

        {/* Tenant Management Table */}
        <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Clientes & Personalização Exclusiva Master</h3>
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
                        <img src={t.logo_url} alt={t.name} className="w-9 h-9 rounded-xl object-cover border border-amber-500/50" />
                        <div>
                          <span>{t.name}</span>
                          <span className="text-xs text-zinc-500 block">{t.phone || '(11) 99999-8888'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-amber-400">/menu/{t.slug}</td>
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
                          onClick={() => setSelectedTenantForTemplate(t)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <FolderPlus className="w-3.5 h-3.5" /> Aplicar Template de Nicho
                        </button>

                        <button
                          onClick={() => handleOpenThemeModal(t)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Palette className="w-3.5 h-3.5" /> Personalizar Layout
                        </button>

                         <button
                          onClick={() => setConfirmDeleteId(t.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>

                        <button
                          onClick={() => toggleStatus(t.id, t.subscription_status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            t.subscription_status === 'active'
                              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
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

      {/* Modal 1: Apply Sector Template (Exclusivo Master) */}
      <Modal
        isOpen={!!selectedTenantForTemplate}
        onClose={() => setSelectedTenantForTemplate(null)}
        title={`📂 Aplicar Cardápio de Nicho: ${selectedTenantForTemplate?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Selecione o modelo comercial para pré-carregar as categorias, produtos e paleta de cores para esta conta.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {SECTOR_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleApplySectorTemplate(tmpl)}
                className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-amber-500/50 hover:bg-white/5 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: tmpl.theme.primary_color }} />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{tmpl.name}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{tmpl.description}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-white/5">
                  <span>{tmpl.categories.length} Categorias</span>
                  <span>{tmpl.products.length} Pratos pré-cadastrados</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal 2: Master Theme Customizer */}
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

          {/* Paletas de Gradiente Completas */}
          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Temas de Gradiente — Escolha uma Paleta Pronta
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {[
                { id: 'emerald',  name: '🌿 Esmeralda Luxury',     primary: '#10b981', secondary: '#059669', bgStart: '#03180e', bgEnd: '#0b2d1c', mode: 'gradient', style: 'glass' },
                { id: 'coffee',   name: '☕ Café & Avelã Moka',     primary: '#d97706', secondary: '#92400e', bgStart: '#170c08', bgEnd: '#2d170e', mode: 'gradient', style: 'glass' },
                { id: 'cyber',    name: '🪐 Cyber Neon Roxo',       primary: '#a855f7', secondary: '#ec4899', bgStart: '#0b0518', bgEnd: '#1e0a38', mode: 'gradient', style: 'vibrant' },
                { id: 'sunset',   name: '🔥 Sunset Grill Fogo',     primary: '#f97316', secondary: '#ef4444', bgStart: '#190704', bgEnd: '#330f08', mode: 'gradient', style: 'vibrant' },
                { id: 'sapphire', name: '💎 Royal Sapphire',        primary: '#06b6d4', secondary: '#3b82f6', bgStart: '#040f1a', bgEnd: '#0a2238', mode: 'gradient', style: 'glass' },
                { id: 'cream',    name: '🍦 Vanilla Soft Light',    primary: '#059669', secondary: '#d97706', bgStart: '#f7f4ef', bgEnd: '#eae2d6', mode: 'light',    style: 'luxury' },
                { id: 'rose',     name: '🌹 Rose & Pink Rouge',     primary: '#f43f5e', secondary: '#e11d48', bgStart: '#1a0309', bgEnd: '#2d0618', mode: 'gradient', style: 'vibrant' },
                { id: 'midnight', name: '🌌 Midnight Indigo',       primary: '#818cf8', secondary: '#6366f1', bgStart: '#06060f', bgEnd: '#0e0e2a', mode: 'gradient', style: 'glass' },
                { id: 'forest',   name: '🌲 Deep Forest Verde',     primary: '#22c55e', secondary: '#16a34a', bgStart: '#030f06', bgEnd: '#071a0c', mode: 'gradient', style: 'glass' },
                { id: 'ocean',    name: '🌊 Ocean Blue Profundo',   primary: '#38bdf8', secondary: '#0ea5e9', bgStart: '#020d17', bgEnd: '#061828', mode: 'gradient', style: 'glass' },
                { id: 'volcanic', name: '🌋 Volcanic Brasa',        primary: '#fb923c', secondary: '#f97316', bgStart: '#140500', bgEnd: '#2a0c00', mode: 'gradient', style: 'vibrant' },
                { id: 'aurora',   name: '🌠 Aurora Boreal',         primary: '#34d399', secondary: '#06b6d4', bgStart: '#020f1a', bgEnd: '#0a1f12', mode: 'gradient', style: 'glass' },
                { id: 'charcoal', name: '🩶 Charcoal Elegante',     primary: '#94a3b8', secondary: '#64748b', bgStart: '#0a0a0a', bgEnd: '#1a1a1a', mode: 'gradient', style: 'minimal' },
                { id: 'golden',   name: '✨ Golden Luxe',           primary: '#fbbf24', secondary: '#f59e0b', bgStart: '#120c00', bgEnd: '#241800', mode: 'gradient', style: 'luxury' },
                { id: 'nordic',   name: '❄️ Nordic Ice Blue',       primary: '#7dd3fc', secondary: '#38bdf8', bgStart: '#030c18', bgEnd: '#0b1c32', mode: 'gradient', style: 'glass' },
              ].map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setThemeConfig({
                    primary_color: pal.primary,
                    secondary_color: pal.secondary,
                    mode: pal.mode as any,
                    style: pal.style as any,
                    gradient_preset: pal.id as any,
                    bg_gradient_start: pal.bgStart,
                    bg_gradient_end: pal.bgEnd,
                  })}
                  className={`p-2.5 rounded-2xl border text-left space-y-1.5 transition-all group ${
                    themeConfig.gradient_preset === pal.id
                      ? 'border-amber-400 bg-white/10 ring-2 ring-amber-500/40 shadow-xl'
                      : 'glass-panel border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white leading-tight">{pal.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: pal.primary }} />
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: pal.secondary }} />
                    </div>
                  </div>
                  <div
                    className="h-1.5 rounded-full w-full border border-white/10"
                    style={{ background: `linear-gradient(to right, ${pal.bgStart}, ${pal.bgEnd})` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Cor Primária Customizada */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">🎨 Cor de Destaque Personalizada</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: 'Laranja',    hex: '#FF5722' },
                { label: 'Vermelho',   hex: '#E11D48' },
                { label: 'Ciano',      hex: '#06B6D4' },
                { label: 'Dourado',    hex: '#B8860B' },
                { label: 'Roxo',       hex: '#8B5CF6' },
                { label: 'Verde',      hex: '#10B981' },
                { label: 'Âmbar',      hex: '#F59E0B' },
                { label: 'Rosa',       hex: '#F43F5E' },
                { label: 'Índigo',     hex: '#6366F1' },
                { label: 'Azul Royal', hex: '#3B82F6' },
                { label: 'Lima',       hex: '#84CC16' },
                { label: 'Coral',      hex: '#FB7185' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setThemeConfig({ ...themeConfig, primary_color: c.hex, gradient_preset: 'custom' })}
                  title={c.label}
                  className={`h-9 rounded-xl border-2 transition-all ${
                    themeConfig.primary_color === c.hex && themeConfig.gradient_preset === 'custom'
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent hover:border-white/40'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Modo de Fundo */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">🌗 Modo de Fundo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'gradient', label: '✨ Gradiente Temático', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { value: 'dark',     label: '🌑 Dark Mode',          icon: <Moon className="w-3.5 h-3.5" /> },
                { value: 'light',    label: '☀️ Light Mode',          icon: <Sun className="w-3.5 h-3.5" /> },
              ].map((m) => (
                <button key={m.value} type="button"
                  onClick={() => setThemeConfig({ ...themeConfig, mode: m.value as any })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    themeConfig.mode === m.value ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estilo Visual */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">💅 Estilo Visual dos Cards</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { value: 'glass',    label: '🪟 Glassmorphism', desc: 'Vidro translúcido' },
                { value: 'minimal',  label: '◽ Minimalista',   desc: 'Clean & leve' },
                { value: 'vibrant',  label: '🎆 Vibrante',      desc: 'Cores intensas' },
                { value: 'luxury',   label: '👑 Luxury',        desc: 'Premium & sofisticado' },
                { value: 'neon',     label: '⚡ Neon Glow',     desc: 'Brilho neon' },
              ].map((s) => (
                <button key={s.value} type="button"
                  onClick={() => setThemeConfig({ ...themeConfig, style: s.value as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    themeConfig.style === s.value ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] opacity-70">{s.desc}</div>
                </button>
              ))}
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

      {/* Modal 3: Confirmação de Exclusão de Tenant */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="⚠️ Confirmar Exclusão de Restaurante"
        maxWidth="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300 leading-relaxed">
              <strong className="text-rose-400 block mb-1">Ação irreversível!</strong>
              Esta operação irá excluir permanentemente o restaurante e todos os seus dados:
              categorias, produtos, pedidos, mesas e métricas de analytics.
              <br /><br />
              O cliente perderá acesso imediato ao painel e ao cardápio digital.
            </div>
          </div>
          <p className="text-sm text-zinc-300 font-medium">
            Restaurante: <strong className="text-white">{tenants.find(t => t.id === confirmDeleteId)?.name}</strong>
          </p>
          <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
            <button
              onClick={() => confirmDeleteId && handleDeleteTenant(confirmDeleteId)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Sim, Excluir Permanentemente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
