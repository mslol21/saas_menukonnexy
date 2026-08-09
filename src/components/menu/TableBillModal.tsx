'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Receipt,
  Users,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Send,
  Sparkles,
  Calculator,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TableBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  tenantName: string;
  tenantId?: string;
  tenantWhatsapp?: string;
}

export const TableBillModal: React.FC<TableBillModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  tenantName,
  tenantId = 'default',
  tenantWhatsapp = '5516991551200',
}) => {
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [includeTip, setIncludeTip] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('card');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Get active consumption from storage
  let currentTotal = 0;
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`konnexy_tables_${tenantId}`);
      if (saved) {
        const tables = JSON.parse(saved);
        const currentTbl = tables.find((t: any) => t.number === tableNumber || t.number === tableNumber.padStart(2, '0'));
        if (currentTbl && currentTbl.active_total) {
          currentTotal = currentTbl.active_total;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback demo total if zero
  const baseAmount = currentTotal > 0 ? currentTotal : 120.00;
  const tipAmount = includeTip ? baseAmount * 0.10 : 0;
  const finalTotal = baseAmount + tipAmount;
  const perPersonAmount = finalTotal / Math.max(1, peopleCount);

  const handleRequestBill = () => {
    // 1. Update Table Status to 'closing' (🔴 Aguardando Conta)
    try {
      if (typeof window !== 'undefined') {
        const storageKey = `konnexy_tables_${tenantId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const tables = JSON.parse(saved);
          const cleanNum = tableNumber.replace(/\D/g, '') || tableNumber;
          const targetInt = parseInt(cleanNum, 10);

          const updated = tables.map((t: any) => {
            const tInt = parseInt((t.number || '').replace(/\D/g, ''), 10);
            if (
              t.number === tableNumber ||
              t.number === cleanNum ||
              t.number === cleanNum.padStart(2, '0') ||
              (targetInt && tInt === targetInt)
            ) {
              return {
                ...t,
                status: 'closing',
                active_total: finalTotal,
              };
            }
            return t;
          });
          localStorage.setItem(storageKey, JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Confetti Effect
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }

    setIsSubmitted(true);
  };

  const handleNotifyWhatsApp = () => {
    const payText =
      paymentMethod === 'pix'
        ? 'Pix na Maquininha / QR Code'
        : paymentMethod === 'card'
        ? 'Cartão na Maquininha (Levar Maquininha)'
        : 'Dinheiro';

    const message =
      `🧾 *SOLICITAÇÃO DE FECHAMENTO DE CONTA*\n\n` +
      `📌 *Mesa:* #${tableNumber}\n` +
      `📍 *Estabelecimento:* ${tenantName}\n` +
      `💰 *Valor Total da Mesa:* R$ ${finalTotal.toFixed(2)}\n` +
      `👥 *Divisão:* ${peopleCount} pessoa(s) (R$ ${perPersonAmount.toFixed(2)} cada)\n` +
      `💳 *Forma de Pagamento:* ${payText}\n\n` +
      `Solicito o fechamento e a maquininha/comprovante na Mesa #${tableNumber}. Obrigado!`;

    const waUrl = `https://wa.me/${tenantWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title={`🧾 Pedir a Conta - Mesa #${tableNumber}`} maxWidth="md">
      {!isSubmitted ? (
        <div className="space-y-6 font-sans">
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Consumo Atual</span>
              <h3 className="text-2xl font-black text-white">R$ {baseAmount.toFixed(2)}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Mesa</span>
              <span className="text-lg font-black text-amber-400">#{tableNumber}</span>
            </div>
          </div>

          {/* Calculator: Split Among Friends */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" /> Dividir Conta na Mesa
              </label>
              <span className="text-xs font-extrabold text-amber-400">
                {peopleCount} {peopleCount === 1 ? 'Pessoa' : 'Pessoas'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={peopleCount}
                onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {peopleCount > 1 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-xs text-zinc-300 block">Valor por Pessoa:</span>
                <span className="text-xl font-black text-amber-400">R$ {perPersonAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Service Tip Toggle (10%) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Taxa de Serviço Opcional (10%)</span>
                <span className="text-[10px] text-zinc-400 block">+ R$ {tipAmount.toFixed(2)} em prol da equipe</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIncludeTip(!includeTip)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                includeTip ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  includeTip ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Forma de Pagamento Desejada</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md'
                    : 'glass-panel text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md'
                    : 'glass-panel text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>Pix na Mesa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md'
                    : 'glass-panel text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Dinheiro</span>
              </button>
            </div>
          </div>

          {/* Summary Footer & Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Total Final a Pagar</span>
              <span className="text-2xl font-black text-amber-400">R$ {finalTotal.toFixed(2)}</span>
            </div>

            <Button variant="primary" size="lg" onClick={handleRequestBill} className="flex-1 font-black">
              Solicitar Fechamento
            </Button>
          </div>
        </div>
      ) : (
        /* Confirmation Screen */
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Solicitação Enviada ao Caixa!</h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto leading-relaxed">
              O status da **Mesa #{tableNumber}** foi alterado para <strong className="text-rose-400">🔴 Aguardando Conta</strong>. O garçom já foi notificado e trará a maquininha/comprovante até sua mesa!
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-white/10 max-w-xs mx-auto text-left space-y-1.5 text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Mesa:</span>
              <span className="font-bold text-white">#{tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total a Pagar:</span>
              <span className="font-bold text-amber-400">R$ {finalTotal.toFixed(2)}</span>
            </div>
            {peopleCount > 1 && (
              <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                <span className="text-zinc-400">Cada Pessoa ({peopleCount}x):</span>
                <span className="font-bold text-emerald-400">R$ {perPersonAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <Button variant="success" size="lg" onClick={handleNotifyWhatsApp} leftIcon={<Send className="w-4 h-4" />}>
              Avisar Garçom no WhatsApp (Opcional)
            </Button>
            <Button variant="outline" size="md" onClick={handleReset}>
              Voltar ao Cardápio
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
