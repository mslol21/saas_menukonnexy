'use client';

import React, { useState, useEffect } from 'react';
import { KitchenOrder } from '@/types';
import { ChefHat, Clock, CheckCircle2, Flame, Bell, Sparkles, ChevronRight } from 'lucide-react';

interface TableOrderTrackerProps {
  tenantId: string;
  tableNumber: string;
  primaryColor?: string;
}

export const TableOrderTracker: React.FC<TableOrderTrackerProps> = ({
  tenantId,
  tableNumber,
  primaryColor = '#B8860B',
}) => {
  const [activeOrders, setActiveOrders] = useState<KitchenOrder[]>([]);

  const loadTableOrders = () => {
    if (typeof window !== 'undefined' && tenantId && tableNumber) {
      try {
        const saved = localStorage.getItem(`konnexy_orders_${tenantId}`);
        if (saved) {
          const allOrders: KitchenOrder[] = JSON.parse(saved);
          const filtered = allOrders.filter(
            (o) =>
              o.table_number === tableNumber ||
              o.table_number === tableNumber.padStart(2, '0')
          ).filter((o) => o.status !== 'completed');
          setActiveOrders(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadTableOrders();
    const interval = setInterval(loadTableOrders, 2000);
    window.addEventListener('storage', loadTableOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadTableOrders);
    };
  }, [tenantId, tableNumber]);

  if (activeOrders.length === 0) return null;

  const currentOrder = activeOrders[0];

  let step = 1;
  let statusTitle = 'Pedido Recebido pela Cozinha';
  let statusDesc = 'Seu pedido foi registrado na fila de preparo.';
  let badgeText = '🟡 Na Fila';
  let badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

  if (currentOrder.status === 'preparing') {
    step = 2;
    statusTitle = 'Prato em Preparo no Fogo!';
    statusDesc = 'O chef já está preparando o seu pedido com carinho.';
    badgeText = '🟧 Em Preparo';
    badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  } else if (currentOrder.status === 'ready') {
    step = 3;
    statusTitle = 'Pronto para Servir!';
    statusDesc = `Seu pedido está pronto! O garçom está levando até a Mesa #${tableNumber}.`;
    badgeText = '🟢 Pronto!';
    badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-bounce';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 mb-6 font-sans">
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-zinc-900/80 to-zinc-900/90 shadow-2xl relative overflow-hidden space-y-4">
        {/* Top Title & Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ChefHat className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Monitoramento da Mesa #{tableNumber}
              </span>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                {statusTitle}
              </h4>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        {/* Status Message */}
        <p className="text-xs text-zinc-300">{statusDesc}</p>

        {/* 3 Step Visual Progress Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-amber-500 shadow-md shadow-amber-500/40' : 'bg-white/10'}`} />
          <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-500 shadow-md shadow-blue-500/40' : 'bg-white/10'}`} />
          <div className={`h-2 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-emerald-500 shadow-md shadow-emerald-500/40' : 'bg-white/10'}`} />
        </div>

        {/* Items Summary list */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
          <span className="truncate max-w-[280px]">
            📦 {currentOrder.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
          </span>
          <span className="font-extrabold text-amber-400">
            Total: R$ {currentOrder.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
