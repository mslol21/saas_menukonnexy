'use client';

import React, { useState } from 'react';
import { Tenant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShieldCheck, CreditCard, Sparkles, Check, QrCode, Copy, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionCardProps {
  tenant: Tenant;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ tenant }) => {
  const [isPixModalOpen, setIsPixModalOpen] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [planType, setPlanType] = useState<'monthly' | 'annual'>(tenant.subscription_plan || 'monthly');

  const pixKey = '+5516991551200';
  const whatsappNumber = '5516991551200';

  const monthlyPrice = 49.90;
  const annualPrice = 499.90;

  const currentPrice = planType === 'annual' ? annualPrice : monthlyPrice;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleSendProof = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }

    const message = `Olá! Realizei o pagamento da assinatura do *Konnexy Menu* via Pix.\n\n` +
      `📌 *Restaurante:* ${tenant.name}\n` +
      `🔗 *Link:* menu.konnexy.com.br/menu/${tenant.slug}\n` +
      `💳 *Plano Escolhido:* ${planType === 'annual' ? 'Anual (R$ 499,90/ano)' : 'Mensal (R$ 49,90/mês)'}\n` +
      `💰 *Valor Pago:* R$ ${currentPrice.toFixed(2).replace('.', ',')}\n\n` +
      `Seguem os dados para confirmação da conta.`;

    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-400" /> Minha Assinatura Konnexy
        </h2>
        <p className="text-xs text-zinc-400">Pagamento seguro via Pix com envio do comprovante para o WhatsApp.</p>
      </div>

      {/* Main Subscription Card */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Plano Atual</span>
            <h3 className="text-2xl font-black text-white">Konnexy Pro ({planType === 'annual' ? 'Anual 499,90' : 'Mensal 49,90'})</h3>
          </div>

          <Badge variant="success" className="px-4 py-1.5 text-xs font-bold uppercase">
            ● Assinatura Ativa
          </Badge>
        </div>

        {/* Plan Selector Switch */}
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 max-w-xs">
          <button
            type="button"
            onClick={() => setPlanType('monthly')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              planType === 'monthly' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mensal (R$ 49,90)
          </button>
          <button
            type="button"
            onClick={() => setPlanType('annual')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              planType === 'annual' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Anual (R$ 499,90)
          </button>
        </div>

        {/* Pricing Info Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-zinc-300">
          <div>
            <span className="text-xs text-zinc-400 block mb-0.5">Vigência / Renovação</span>
            <span className="font-bold text-white">31 de Dezembro de 2027</span>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-0.5">Valor do Plano Escolhido</span>
            <span className="font-black text-emerald-400 text-lg">
              R$ {currentPrice.toFixed(2).replace('.', ',')} {planType === 'annual' ? '/ano' : '/mês'}
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2 text-xs text-zinc-300">
          <p className="font-bold text-zinc-400 uppercase tracking-wider mb-3">Benefícios Inclusos no Seu Estabelecimento:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Produtos e Categorias Ilimitadas</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Carrinho com Envio para o WhatsApp</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Gerador de QR Code por Mesa</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Domínio Exclusivo e PWA Offline</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Suporte Prioritário VIP no WhatsApp</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Zero Comissões sobre Vendas</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsPixModalOpen(true)}
            className="w-full sm:w-auto text-base font-bold shadow-lg shadow-orange-500/20"
            leftIcon={<QrCode className="w-5 h-5" />}
          >
            Pagar / Renovar Assinatura via Pix
          </Button>
        </div>
      </div>

      {/* Pix Payment Modal */}
      <Modal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        title="💳 Pagamento da Assinatura via Pix"
        maxWidth="lg"
      >
        <div className="space-y-6 text-center">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Pagamento rápido via Pix com liberação no WhatsApp +55 16 99155-1200
          </div>

          {/* Pix Key Display */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 max-w-md mx-auto">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Chave Pix (Telefone)</span>
            <div className="flex items-center justify-between gap-2 p-3 bg-zinc-900 rounded-xl border border-white/10 font-mono text-base font-bold text-orange-400">
              <span>{pixKey}</span>
              <button
                type="button"
                onClick={handleCopyPix}
                className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
              >
                {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copiado!' : 'Copiar Chave'}</span>
              </button>
            </div>
            <span className="text-[11px] text-zinc-400 block">
              Valor exato a pagar: <strong className="text-white">R$ {currentPrice.toFixed(2).replace('.', ',')}</strong> ({planType === 'annual' ? 'Plano Anual R$ 499,90' : 'Plano Mensal R$ 49,90'})
            </span>
          </div>

          {/* Instructions Steps */}
          <div className="text-left space-y-2 text-xs text-zinc-300 glass-panel p-5 rounded-2xl border border-white/10">
            <h4 className="font-bold text-white uppercase tracking-wider mb-2">Passo a Passo para Liberação:</h4>
            <ol className="space-y-2 list-decimal list-inside text-zinc-400">
              <li>Abra o app do seu banco e selecione **Pix (Transferência por Telefone)**.</li>
              <li>Insira a chave **{pixKey}** e informe o valor de **R$ {currentPrice.toFixed(2).replace('.', ',')}**.</li>
              <li>Após o pagamento, clique no botão abaixo para **Enviar o Comprovante no WhatsApp**.</li>
            </ol>
          </div>

          {/* Submit Proof Button */}
          <div className="pt-2">
            <Button
              variant="success"
              size="lg"
              onClick={handleSendProof}
              className="w-full text-base font-bold py-4 gap-2 shadow-xl shadow-emerald-500/20"
              leftIcon={<Send className="w-5 h-5" />}
            >
              Enviar Comprovante para WhatsApp (+55 16 99155-1200)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
