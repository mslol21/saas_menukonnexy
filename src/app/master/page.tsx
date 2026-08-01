'use client';

import React, { useState, useEffect } from 'react';
import { MasterDashboard } from '@/components/master/MasterDashboard';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Lock, Key, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MasterPage() {
  const { profile } = useAuth();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [masterEmail, setMasterEmail] = useState<string>('');
  const [masterPass, setMasterPass] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const savedMaster = typeof window !== 'undefined' ? sessionStorage.getItem('konnexy_master_unlocked') : null;
    if (savedMaster === 'true' || profile?.role === 'master') {
      setIsUnlocked(true);
    }
  }, [profile]);

  const handleMasterUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validEmails = ['master@konnexy.com.br', 'admin@konnexy.com.br', 'mslol21@github.com'];
    const validPasscodes = ['konnexy2026', 'master123', 'admin2026'];

    const isEmailValid = validEmails.includes(masterEmail.trim().toLowerCase()) || masterEmail.includes('master');
    const isPassValid = validPasscodes.includes(masterPass.trim());

    if (isEmailValid && isPassValid) {
      setIsUnlocked(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('konnexy_master_unlocked', 'true');
      }
    } else {
      setErrorMsg('Credenciais de Super Admin incorretas. Acesso negado.');
    }
  };

  const handleLockMaster = () => {
    setIsUnlocked(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('konnexy_master_unlocked');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative font-sans selection:bg-amber-500 selection:text-white">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-cyan-500/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-amber-500/30 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/40 p-0.5 bg-zinc-900 mx-auto mb-4 shadow-xl shadow-amber-500/10">
              <img src="/konnexy-logo.jpg" alt="Konnexy Menu Logo" className="w-full h-full object-cover rounded-xl" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
              Segurança Elevada • Super Admin
            </span>

            <h1 className="text-2xl font-black tracking-tight text-white">Login Master da Plataforma</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Informe suas credenciais administrativas para desbloquear o painel global.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleMasterUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">E-mail Master *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={masterEmail}
                  onChange={(e) => setMasterEmail(e.target.value)}
                  placeholder="master@konnexy.com.br"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Senha de Segurança Master *</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  value={masterPass}
                  onChange={(e) => setMasterPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold text-base mt-2 shadow-lg shadow-amber-500/20"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Desbloquear Painel Master
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-zinc-500">
              Chave Master Padrão: E-mail <code className="text-amber-400">master@konnexy.com.br</code> • Senha <code className="text-amber-400">konnexy2026</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50">
        <Button variant="danger" size="sm" onClick={handleLockMaster} leftIcon={<Lock className="w-3.5 h-3.5" />}>
          Trancar Painel Master
        </Button>
      </div>
      <MasterDashboard />
    </div>
  );
}
