'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, MessageSquare, Zap, Smartphone, Globe, Shield, Sparkles, SlidersHorizontal, BarChart3 } from 'lucide-react';

const FEATURE_LIST = [
  {
    icon: <QrCode className="w-6 h-6 text-orange-400" />,
    title: 'QR Code Inteligente por Mesa',
    description: 'Gere códigos QR para cada mesa ou balcão. O cliente escaneia e o pedido chega no seu WhatsApp identificado com o número da mesa.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
    title: 'Carrinho Direto para o WhatsApp',
    description: 'Formatação limpa e profissional com os pratos, adicionais, observações e cálculo exato de subtotal enviado em 1 clique.',
  },
  {
    icon: <Smartphone className="w-6 h-6 text-purple-400" />,
    title: 'PWA Instalável e Offline',
    description: 'O cliente pode instalar seu cardápio como um aplicativo no Android/iPhone e navegar até sem internet com carregamento instantâneo.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
    title: 'Painel com Métricas de Vendas',
    description: 'Acompanhe contagem de visualizações, QR Codes escaneados, pratos mais acessados e estatísticas em tempo real no seu Dashboard.',
  },
  {
    icon: <Globe className="w-6 h-6 text-amber-400" />,
    title: 'SEO & Meta Tags Automáticas',
    description: 'Cada categoria e prato ganha uma URL indexada no Google com dados estruturados Schema.org para atração orgânica.',
  },
  {
    icon: <SlidersHorizontal className="w-6 h-6 text-rose-400" />,
    title: 'Filtros Dietéticos & Alérgenos',
    description: 'Permita que clientes filtrem opções Veganas, Fit, Sem Glúten, Sem Lactose, Apimentadas e Zero Açúcar instantaneamente.',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="funcionalidades" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Recursos Exclusivos</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Tudo o que seu negócio precisa para crescer sem pagar taxas
          </h2>
          <p className="mt-4 text-zinc-400">
            Arquitetura moderna projetada para máxima velocidade, conversão e autonomia total para o proprietário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_LIST.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
