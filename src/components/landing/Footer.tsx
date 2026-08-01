'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-12 text-zinc-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">
                🍴
              </div>
              <span className="text-xl font-black text-white tracking-tight">Konnexy Menu</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              A plataforma definitiva de cardápios digitais inteligentes para restaurantes, bares, hamburguerias e cafeterias.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#beneficios" className="hover:text-orange-400 transition-colors">Benefícios</a></li>
              <li><a href="#funcionalidades" className="hover:text-orange-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-orange-400 transition-colors">Planos & Preços</a></li>
              <li><Link href="/menu/calixto-burger" className="hover:text-orange-400 transition-colors">Cardápio de Exemplo</Link></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Plataforma</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-orange-400 transition-colors">Painel do Restaurante</Link></li>
              <li><Link href="/master" className="hover:text-orange-400 transition-colors">Painel Master Admin</Link></li>
              <li><Link href="/login" className="hover:text-orange-400 transition-colors">Área do Cliente</Link></li>
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
                className="text-base font-extrabold text-orange-400 hover:text-orange-300 transition-colors block"
              >
                +55 (16) 99155-1200
              </a>
              <p className="text-[11px] text-zinc-500 mt-2">Konnexy Tech Ltd • CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Konnexy Menu. Todos os direitos reservados.</p>
          <p>Desenvolvido com ❤️ pela equipe Konnexy.</p>
        </div>
      </div>
    </footer>
  );
};
