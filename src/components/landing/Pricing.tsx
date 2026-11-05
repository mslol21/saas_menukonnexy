'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="precos" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3 uppercase tracking-wider">
            Assinatura Konnexy Menu
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Seu cardápio, sem comissão por pedido
          </h2>
          <p className="mt-4 text-zinc-400">
            Escolha o período de assinatura para o seu estabelecimento.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex flex-wrap justify-center items-center gap-2 p-1.5 glass-panel rounded-full border border-white/10">
            <button
              aria-pressed={!isAnnual}
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                !isAnnual ? 'bg-cyan-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mensal (R$ 59,90)
            </button>
            <button
              aria-pressed={isAnnual}
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                isAnnual ? 'bg-gradient-to-r from-cyan-500 to-cyan-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Anual (R$ 599,90)</span>
              <span className="text-[10px] bg-white text-cyan-600 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Economia Especial
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-cyan-500/50 shadow-2xl relative"
          >
            <div className="absolute -top-4 right-8">
              <span className="bg-gradient-to-r from-cyan-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Plano Pro
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Plano Konnexy Pro</h3>
              <p className="text-sm text-zinc-400 mt-1">Tudo o que seu estabelecimento precisa para operar no digital.</p>
            </div>

            {/* Price Display */}
            <div className="flex flex-wrap items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold text-white">
                R$ {isAnnual ? '599,90' : '59,90'}
              </span>
              <span className="text-zinc-400 font-medium">{isAnnual ? '/ano' : '/mês'}</span>
              {isAnnual && (
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 ml-2">
                  Economize pagando anualmente
                </span>
              )}
            </div>

            {/* Features Checklist */}
            <ul className="space-y-3.5 mb-8 text-sm text-zinc-300">
              {[
                'Gestão de Produtos e Categorias',
                'Carrinho com Envio para o WhatsApp',
                'Gerador de QR Code por Mesa',
                'Link exclusivo para o seu cardápio',
                'Filtros Dietéticos & Alérgenos',
                'Acesso pelo navegador do celular',
                'Upload de fotos dos produtos',
                'Painel de Métricas & Relatórios',
                'Zero Taxas sobre Vendas',
                'Suporte Prioritário VIP no WhatsApp (+55 16 99155-1200)',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/login" className="k-link k-link-primary w-full">Começar meu cardápio <ArrowRight size={18}/></Link>
            <p className="text-center text-xs text-zinc-500 mt-4">Consulte as condições de pagamento e ativação no painel.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
