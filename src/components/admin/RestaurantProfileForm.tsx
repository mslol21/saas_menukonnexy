'use client';

import React, { useState } from 'react';
import { Tenant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Save, Store, Phone, Instagram, MapPin, Globe, Clock, CheckCircle2, Palette, ShieldCheck } from 'lucide-react';

interface RestaurantProfileFormProps {
  tenant: Tenant;
  onSave: (updated: Tenant) => void;
}

export const RestaurantProfileForm: React.FC<RestaurantProfileFormProps> = ({ tenant, onSave }) => {
  const [formData, setFormData] = useState<Tenant>(tenant);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Dados do Estabelecimento</h2>
          <p className="text-xs text-zinc-400">Edite as informações operacionais exibidas no seu cardápio público.</p>
        </div>

        <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
          Salvar Alterações
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Dados do estabelecimento salvos com sucesso!
        </div>
      )}

      {/* Master Exclusive Customization Badge Notice */}
      <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 bg-purple-500/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Personalização de Tema & Layout
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              As cores, estilo e modo do layout público são gerenciados exclusivamente pelo **Suporte Master Konnexy**.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 whitespace-nowrap">
          Controle Master
        </span>
      </div>

      {/* Main Info */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-orange-400" /> Identificação da Empresa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Estabelecimento *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">URL amigável (Slug ex: menu.com/slug) *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição / Biografia</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">URL do Logo</label>
            <input
              type="text"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">URL do Banner de Capa</label>
            <input
              type="text"
              value={formData.banner_url}
              onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>
      </div>

      {/* Contact & Social Links */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-400" /> Contatos & Redes Sociais
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Número do WhatsApp (Com DDD) *</label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Instagram (@seuusuario)</label>
            <input
              type="text"
              value={formData.instagram || ''}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400" /> Localização & Endereço
        </h3>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Endereço Completo</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>
    </form>
  );
};
