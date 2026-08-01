import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-12 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">Konnexy Menu</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A plataforma definitiva de cardápios digitais inteligentes para restaurantes, bares, hamburguerias e cafeterias.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a></li>
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Planos & Preços</a></li>
              <li><Link href="/menu/calixto-burger" className="hover:text-white transition-colors">Cardápio de Exemplo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Plataforma</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/admin" className="hover:text-white transition-colors">Painel do Restaurante</Link></li>
              <li><Link href="/master" className="hover:text-white transition-colors">Painel Master Admin</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Área do Cliente</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Contato & Suporte</h4>
            <p className="text-xs text-zinc-400 mb-2">Suporte 24/7 via WhatsApp:</p>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="text-xs text-orange-400 font-bold hover:underline block mb-4">
              +55 (11) 99999-9999
            </a>
            <span className="text-[11px] text-zinc-500 block">Konnexy Tech Ltd • CNPJ 00.000.000/0001-00</span>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Konnexy Menu. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> pela equipe Konnexy
          </p>
        </div>
      </div>
    </footer>
  );
};
