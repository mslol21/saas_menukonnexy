'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, ArrowRight, Menu as MenuIcon, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-panel border-b border-white/10 py-3 backdrop-blur-xl' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Official Konnexy Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-cyan-500/40 p-0.5 bg-gradient-to-tr from-cyan-500/20 via-cyan-500/20 to-zinc-900 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform shrink-0">
            <img src="/konnexy-logo.jpg" alt="Konnexy Menu Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <span className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1">
              KONNEXY <span className="text-cyan-400 font-bold">MENU</span>
            </span>
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase block -mt-1 font-extrabold">
              Um produto Konnexy
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-zinc-300">
          <a href="#beneficios" className="hover:text-cyan-400 transition-colors">Benefícios</a>
          <a href="#funcionalidades" className="hover:text-cyan-400 transition-colors">Funcionalidades</a>
          <a href="#demonstracao" className="hover:text-cyan-400 transition-colors">Demonstração</a>
          <a href="#precos" className="hover:text-cyan-400 transition-colors">Planos</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden xl:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2.5 rounded-xl glass-panel text-zinc-300 hover:text-white transition-colors border border-white/10"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          <Link href="/login" className="k-link">Entrar</Link>

          <Link href="/menu/calixto-burger" className="k-link k-link-primary">Ver demonstração <ArrowRight size={16}/></Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex xl:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded-xl glass-panel text-zinc-300 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-panel text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="xl:hidden max-h-[calc(100dvh-90px)] overflow-y-auto glass-panel border-b border-white/10 px-6 py-6 flex flex-col gap-4 mt-3">
          <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-cyan-400 py-1">Benefícios</a>
          <a href="#funcionalidades" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-cyan-400 py-1">Funcionalidades</a>
          <a href="#demonstracao" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-cyan-400 py-1">Demonstração</a>
          <a href="#precos" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-cyan-400 py-1">Planos</a>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link href="/login" className="k-link k-link-secondary">Acessar painel</Link>
            <Link href="/menu/calixto-burger" className="k-link k-link-primary">Ver demonstração</Link>
          </div>
        </div>
      )}
    </header>
  );
};
