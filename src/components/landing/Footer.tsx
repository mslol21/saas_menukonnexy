'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-12 text-zinc-400 font-sans relative overflow-hidden">
      {/* Background Subtle Cyan/Gold Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-amber-500/40 p-0.5 bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-zinc-900 shadow-lg shadow-amber-500/10 shrink-0">
                <img src="/konnexy-logo.jpg" alt="Konnexy Menu Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight flex items-center gap-1">
                  KONNEXY <span className="text-amber-400 font-bold">MENU</span>
                </span>
                <span className="text-[10px] text-cyan-400 tracking-widest uppercase block -mt-1 font-extrabold">
                  Digital Menu SaaS
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              A plataforma definitiva de cardápios digitais inteligentes para restaurantes, bares, hamburguerias e cafeterias.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#beneficios" className="hover:text-amber-400 transition-colors">Benefícios</a></li>
              <li><a href="#funcionalidades" className="hover:text-amber-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-amber-400 transition-colors">Planos & Preços</a></li>
              <li><Link href="/menu/calixto-burger" className="hover:text-amber-400 transition-colors">Cardápio de Exemplo</Link></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Plataforma</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-amber-400 transition-colors">Painel do Restaurante</Link></li>
              <li><Link href="/master" className="hover:text-amber-400 transition-colors">Painel Master Admin</Link></li>
              <li><Link href="/login" className="hover:text-amber-400 transition-colors">Área do Cliente</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contato & Suporte</h4>
            <div className="space-y-2 text-xs">
              <p className="text-zinc-400">Suporte 24/7 via WhatsApp:</p>
              <a
                href="https://wa.me/5516991551200"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-extrabold text-amber-400 hover:text-amber-300 transition-colors block"
              >
                +55 (16) 99155-1200
              </a>
              <div className="text-[11px] text-zinc-500 mt-2 space-y-0.5">
                <p>Konnexy Tech Ltd • CPF: 652.025.205-93</p>
                <p>Sede / CEP: 55573-965</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Konnexy Menu. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <span className="text-amber-400">⚡</span> pela equipe <strong className="text-white">Konnexy</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};
