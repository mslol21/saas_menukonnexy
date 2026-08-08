'use client';

import React from 'react';
import { Tenant } from '@/types';
import { MapPin, Instagram, Share2, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface MenuHeaderProps {
  tenant: Tenant;
  isLight?: boolean;
  primaryColor?: string;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ tenant, isLight = false, primaryColor = '#B8860B' }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tenant.name,
        text: tenant.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link do cardápio copiado!');
    }
  };

  const bannerText = tenant.promo_banner_text || 'PEDIDO DIRETO SEM TAXAS • Peça direto pelo cardápio digital com envio instantâneo!';

  return (
    <div className="relative mb-6">
      {/* Top Dynamic Promotional Offer Banner */}
      <div
        style={{ backgroundColor: primaryColor }}
        className="text-white text-xs font-black text-center py-2 px-4 shadow-md flex items-center justify-center gap-2 flex-wrap"
      >
        <Flame className="w-4 h-4 fill-white animate-bounce shrink-0" />
        <span>{bannerText}</span>
      </div>

      {/* Banner Capa */}
      <div className="h-44 sm:h-64 w-full relative overflow-hidden bg-zinc-900">
        {tenant.banner_url ? (
          <img
            src={tenant.banner_url}
            alt={tenant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-zinc-100 via-zinc-100/40' : 'from-zinc-950 via-zinc-950/40'} to-transparent`} />

        {/* Share Button Top Right */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 p-2.5 rounded-full glass-panel text-white border border-white/20 hover:bg-white/20 transition-all shadow-lg z-10"
          title="Compartilhar Cardápio"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Info Box */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-20">
        <div className={`p-5 sm:p-8 rounded-3xl border shadow-2xl flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-colors ${
          isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/50' : 'glass-panel border-white/10 text-white'
        }`}>
          <div className="flex gap-4 items-center">
            {/* Logo */}
            <div
              style={{ borderColor: primaryColor }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 bg-zinc-900 shadow-xl shrink-0"
            >
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {tenant.name}
                </h1>
                <Badge variant="success" className="text-[10px] px-2.5 py-0.5 font-bold uppercase">
                  ● Aberto Agora
                </Badge>
              </div>

              <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                {tenant.description}
              </p>

              {/* Social and Info Chips */}
              <div className={`flex items-center gap-4 mt-3 flex-wrap text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {tenant.address && (
                  <a
                    href={tenant.google_maps_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="truncate max-w-[200px]">{tenant.address}</span>
                  </a>
                )}

                {tenant.instagram && (
                  <a
                    href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>{tenant.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
