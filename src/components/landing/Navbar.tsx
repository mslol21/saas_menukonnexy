'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { UtensilsCrossed, Sun, Moon, ArrowRight, Menu as MenuIcon, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass-panel border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Konnexy <span className="text-orange-500 font-normal">Menu</span>
            </span>
            <span className="text-[10px] text-zinc-400 tracking-widest uppercase block -mt-1 font-semibold">
              Digital Menu SaaS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
          <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#demonstracao" className="hover:text-white transition-colors">Demonstração</a>
          <a href="#precos" className="hover:text-white transition-colors">Planos</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-panel text-zinc-300 hover:text-white transition-colors border border-white/10"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>

          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>

          <Link href="/menu/calixto-burger">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Ver Demo Vivo
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl glass-panel text-zinc-300 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-panel text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-6 py-6 flex flex-col gap-4 mt-3">
          <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1">Benefícios</a>
          <a href="#funcionalidades" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1">Funcionalidades</a>
          <a href="#demonstracao" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1">Demonstração</a>
          <a href="#precos" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-1">Planos</a>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <Link href="/login">
              <Button variant="outline" className="w-full">Acessar Painel</Button>
            </Link>
            <Link href="/menu/calixto-burger">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ver Cardápio Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
