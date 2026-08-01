'use client';

import React from 'react';
import { Tenant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, CreditCard, Sparkles, Check } from 'lucide-react';

interface SubscriptionCardProps {
  tenant: Tenant;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ tenant }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-400" /> Minha Assinatura Konnexy
        </h2>
        <p className="text-xs text-zinc-400">Gerencie a vigência do seu plano e forma de faturamento.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Plano Atual</span>
            <h3 className="text-2xl font-black text-white">Konnexy Pro ({tenant.subscription_plan === 'annual' ? 'Anual' : 'Mensal'})</h3>
          </div>

          <Badge variant="success" className="px-4 py-1.5 text-xs font-bold uppercase">
            ● Assinatura Ativa
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 text-sm text-zinc-300">
          <div>
            <span className="text-xs text-zinc-400 block">Renovação Próxima</span>
            <span className="font-bold text-white">31 de Dezembro de 2027</span>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Valor Recorrente</span>
            <span className="font-bold text-emerald-400">
              R$ {tenant.subscription_plan === 'annual' ? '49,00' : '69,00'} /mês
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6 text-xs text-zinc-300">
          <p className="font-bold text-zinc-400 uppercase tracking-wider mb-2">Benefícios Ativos no Seu Estabelecimento:</p>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Produtos e Categorias Ilimitadas</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> WhatsApp Cart & Gerador de QR Code</div>
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Domínio Exclusivo e PWA Offline</div>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" size="md">Alterar Dados de Pagamento</Button>
        </div>
      </div>
    </div>
  );
};
