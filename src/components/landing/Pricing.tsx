'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, Sparkles, Zap, ArrowRight } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="precos" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3 uppercase tracking-wider">
            Plano Único & Sem Pegadinhas
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Acesso Ilimitado sem Comissões por Pedido
          </h2>
          <p className="mt-4 text-zinc-400">
            Cancele a qualquer momento. Suporte prioritário e todas as atualizações inclusas.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 glass-panel rounded-full border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                !isAnnual ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                isAnnual ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] bg-white text-orange-600 font-extrabold px-2 py-0.5 rounded-full uppercase">
                30% OFF
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
            className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-orange-500/50 shadow-2xl relative"
          >
            <div className="absolute -top-4 right-8">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Mais Escolhido
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Plano Konnexy Pro</h3>
              <p className="text-sm text-zinc-400 mt-1">Tudo o que seu estabelecimento precisa para operar no digital.</p>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold text-white">
                R$ {isAnnual ? '49' : '69'}
              </span>
              <span className="text-zinc-400 font-medium">/mês</span>
              {isAnnual && (
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 ml-2">
                  Faturado R$ 588 /ano
                </span>
              )}
            </div>

            {/* Features Checklist */}
            <ul className="space-y-3.5 mb-8 text-sm text-zinc-300">
              {[
                'Produtos & Categorias Ilimitadas',
                'Carrinho com Envio para o WhatsApp',
                'Gerador de QR Code por Mesa',
                'Subdomínio Exclusivo (konnexy.com.br/seu-nome)',
                'Filtros Dietéticos & Alérgenos',
                'PWA Instalável no Celular',
                'Upload & Otimização WebP Automática',
                'Painel de Métricas & Relatórios',
                'Zero Taxas sobre Vendas',
                'Suporte Prioritário VIP',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/admin">
              <Button variant="primary" size="lg" className="w-full text-base font-bold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Começar Teste Grátis de 7 Dias
              </Button>
            </Link>
            <p className="text-center text-xs text-zinc-500 mt-4">Sem necessidade de cartão de crédito para testar.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
