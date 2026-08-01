'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Smartphone, ShoppingBag, Sparkles, CheckCircle2, Flame, Heart } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

export const DemoPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'burgers' | 'bebidas' | 'porcoes'>('burgers');

  return (
    <section id="demonstracao" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Demonstração Interativa</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Experiência de Compra Incrível no Celular do Seu Cliente
          </p>
          <p className="mt-4 text-zinc-400">
            Layout fluido com inspiração na Apple, suporte a fotos em altíssima definição, tags de alérgenos e carrinho com envio para o WhatsApp em 1 clique.
          </p>
        </div>

        {/* Device Frame */}
        <div className="relative max-w-[360px] mx-auto">
          {/* Phone Shell */}
          <div className="relative glass-panel rounded-[50px] p-4 border-4 border-zinc-700 shadow-2xl shadow-orange-500/10">
            {/* Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
            </div>

            {/* Screen Content */}
            <div className="bg-zinc-950 rounded-[38px] overflow-hidden pt-10 pb-6 px-3 border border-white/5 font-sans min-h-[580px]">
              {/* Restaurant Header */}
              <div className="relative h-28 rounded-2xl overflow-hidden mb-3">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&fit=crop"
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&fit=crop"
                    alt="Logo"
                    className="w-10 h-10 rounded-xl border-2 border-orange-500 object-cover shadow-lg"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white leading-none">Calixto Burger</h4>
                    <span className="text-[10px] text-emerald-400 font-medium">● Aberto Agora</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveTab('burgers')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'burgers' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  🔥 Mais Vendidos
                </button>
                <button
                  onClick={() => setActiveTab('porcoes')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'porcoes' ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  🍟 Porções
                </button>
                <button
                  onClick={() => setActiveTab('bebidas')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'bebidas' ? 'bg-orange-500 text-white' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  🥤 Shakes
                </button>
              </div>

              {/* Demo Product Cards */}
              <div className="space-y-3">
                {MOCK_PRODUCTS.slice(0, 2).map((item) => (
                  <div key={item.id} className="glass-panel p-2.5 rounded-2xl flex gap-3 items-center border border-white/10 hover:border-orange-500/40 transition-all">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-snug">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-extrabold text-orange-400">
                          R$ {item.promo_price ? item.promo_price.toFixed(2) : item.price.toFixed(2)}
                        </span>
                        <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                          +
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Cart Floating Bar */}
              <div className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-2.5 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-bold">2 Itens selecionados</span>
                </div>
                <span className="text-xs font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                  Pedir no WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
