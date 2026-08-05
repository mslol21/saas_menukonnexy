'use client';

import React, { useState } from 'react';
import { Tenant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Save, Store, Phone, MapPin, CheckCircle2, Palette, ShieldCheck, Flame, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RestaurantProfileFormProps {
  tenant: Tenant;
  onSave: (updated: Tenant) => void;
}

export const RestaurantProfileForm: React.FC<RestaurantProfileFormProps> = ({ tenant, onSave }) => {
  const [formData, setFormData] = useState<Tenant>(tenant);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleFileUpload = async (file: File, target: 'logo' | 'banner') => {
    if (!file) return;

    if (target === 'logo') setIsUploadingLogo(true);
    if (target === 'banner') setIsUploadingBanner(true);

    try {
      // 1. If Supabase Storage configured, attempt storage upload
      if (isSupabaseConfigured()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${tenant.id}-${target}-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('images').upload(fileName, file, { upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            setFormData((prev) => ({
              ...prev,
              [target === 'logo' ? 'logo_url' : 'banner_url']: publicUrlData.publicUrl,
            }));
            if (target === 'logo') setIsUploadingLogo(false);
            if (target === 'banner') setIsUploadingBanner(false);
            return;
          }
        }
      }

      // 2. Fallback: Base64 Data URL reader for instant offline / local support
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            [target === 'logo' ? 'logo_url' : 'banner_url']: result,
          }));
        }
        if (target === 'logo') setIsUploadingLogo(false);
        if (target === 'banner') setIsUploadingBanner(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      if (target === 'logo') setIsUploadingLogo(false);
      if (target === 'banner') setIsUploadingBanner(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Dados do Estabelecimento</h2>
          <p className="text-xs text-zinc-400">Edite as informações operacionais, fotos e avisos exibidos no seu cardápio público.</p>
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

      {/* Top Promotional Banner Customizer */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" /> Banner Promocional do Topo do Cardápio
        </h3>
        <p className="text-xs text-zinc-300">
          Personalize a mensagem em destaque exibida no topo do seu cardápio público para atrair e converter clientes.
        </p>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Texto da Promoção / Anúncio</label>
          <input
            type="text"
            value={formData.promo_banner_text || ''}
            onChange={(e) => setFormData({ ...formData, promo_banner_text: e.target.value })}
            placeholder="Ex: 🔥 PEDIDO DIRETO SEM TAXAS • Peça direto pelo cardápio com envio instantâneo!"
            className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
          />
          <span className="text-[11px] text-zinc-500 block mt-1">
            Se deixado em branco, será exibido o banner padrão promocional de entregas diretas sem taxa.
          </span>
        </div>
      </div>

      {/* Main Info */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
          <Store className="w-4 h-4 text-amber-400" /> Identificação & Imagens da Marca
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Estabelecimento *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">URL amigável (Slug ex: menu.com/slug) *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
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
            className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* LOGO UPLOAD & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" /> Logotipo do Estabelecimento
            </label>

            {/* Thumbnail Preview */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500 bg-zinc-900 shrink-0 shadow-lg">
                <img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/40 text-xs font-bold transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingLogo ? 'Carregando...' : 'Enviar Imagem do Dispositivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                  />
                </label>

                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="Ou cole a URL da imagem aqui"
                  className="w-full px-3 py-1.5 rounded-lg glass-panel text-xs text-white border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* BANNER UPLOAD & URL */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" /> Banner de Capa do Cardápio
            </label>

            {/* Thumbnail Preview */}
            <div className="space-y-2">
              <div className="w-full h-20 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-lg">
                <img src={formData.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/40 text-xs font-bold transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingBanner ? 'Carregando...' : 'Enviar Banner do Dispositivo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
                  />
                </label>

                <input
                  type="text"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  placeholder="Ou cole a URL do banner aqui"
                  className="w-full px-3 py-1.5 rounded-lg glass-panel text-xs text-white border border-white/10"
                />
              </div>
            </div>
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
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Instagram (@seuusuario)</label>
            <input
              type="text"
              value={formData.instagram || ''}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
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
            className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>
    </form>
  );
};
