'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { UtensilsCrossed, ArrowRight, Lock, Mail, Store, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login & redirect to admin
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </Link>

          <h2 className="text-2xl font-black tracking-tight">
            {isRegister ? 'Criar Minha Conta no Konnexy' : 'Acessar Meu Painel'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isRegister ? 'Receba seu link exclusivo em menos de 2 minutos' : 'Gerencie pratos, QR Codes e métricas'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Nome do Seu Restaurante *</label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Ex: Calixto Burger & Grill"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">E-mail *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@restaurante.com.br"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Senha *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold text-base mt-2" rightIcon={<ArrowRight className="w-5 h-5" />}>
            {isRegister ? 'Criar Minha Conta Grátis' : 'Entrar no Painel'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-zinc-400">
          {isRegister ? (
            <p>
              Já tem um cardápio cadastrado?{' '}
              <button onClick={() => setIsRegister(false)} className="text-orange-400 font-bold hover:underline">
                Fazer Login
              </button>
            </p>
          ) : (
            <p>
              Ainda não tem conta?{' '}
              <button onClick={() => setIsRegister(true)} className="text-orange-400 font-bold hover:underline">
                Criar Cardápio Grátis
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
