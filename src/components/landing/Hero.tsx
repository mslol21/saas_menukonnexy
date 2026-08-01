'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, ArrowRight, QrCode, Smartphone, Zap, ShieldCheck, Star } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/20 to-purple-600/20 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <Badge variant="primary" className="py-1.5 px-4 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Konnexy Menu 2.0 • O Cardápio Digital Mais Rápido do Brasil
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1]"
        >
          Transforme seu estabelecimento com o <br className="hidden sm:block" />
          <span className="text-gradient">Cardápio Digital Inteligente</span> de Alta Performance
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          Crie em 2 minutos o link exclusivo do seu restaurante. Receba pedidos direto no WhatsApp, imprima QR Codes para as mesas, ofereça PWA offline e alavanque suas vendas sem pagar comissões.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/admin">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto text-base">
              Criar Meu Cardápio Agora
            </Button>
          </Link>
          <Link href="/menu/calixto-burger">
            <Button size="lg" variant="glass" leftIcon={<Smartphone className="w-5 h-5 text-orange-400" />} className="w-full sm:w-auto text-base">
              Ver Exemplo de Cardápio Vivo
            </Button>
          </Link>
        </motion.div>

        {/* Proof metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-zinc-300"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">0%</span>
            <span className="text-xs text-zinc-400 font-medium">Taxa ou Comissão</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 0.5s</span>
            <span className="text-xs text-zinc-400 font-medium">Velocidade de Carga</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
            <span className="text-xs text-zinc-400 font-medium">Integrado ao WhatsApp</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-2xl sm:text-3xl text-white">4.9/5</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">+1.500 Estabelecimentos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
