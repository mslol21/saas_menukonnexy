'use client';

import React from 'react';
import { Tenant } from '@/types';
import { MapPin, Phone, Instagram, Clock, Globe, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface MenuHeaderProps {
  tenant: Tenant;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ tenant }) => {
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

  return (
    <div className="relative mb-6">
      {/* Banner */}
      <div className="h-44 sm:h-64 w-full relative overflow-hidden bg-zinc-900">
        {tenant.banner_url ? (
          <img
            src={tenant.banner_url}
            alt={tenant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-600 to-amber-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
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
        <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange-500 bg-zinc-900 shadow-xl shrink-0">
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{tenant.name}</h1>
                <Badge variant="success" className="text-[10px] px-2 py-0.5">
                  ● Aberto Agora
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2">{tenant.description}</p>

              {/* Social and Info Chips */}
              <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-zinc-400">
                {tenant.address && (
                  <a
                    href={tenant.google_maps_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span className="truncate max-w-[200px]">{tenant.address}</span>
                  </a>
                )}

                {tenant.instagram && (
                  <a
                    href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-pink-400 transition-colors"
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
