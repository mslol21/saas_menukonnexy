'use client';

import React, { useState, useEffect } from 'react';
import { KitchenOrder } from '@/types';
import { Button } from '@/components/ui/Button';
import { ChefHat, Clock, CheckCircle2, QrCode, MapPin, Store, AlertCircle, RefreshCw, Volume2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface KitchenMonitorProps {
  tenantId: string;
}

export const KitchenMonitor: React.FC<KitchenMonitorProps> = ({ tenantId }) => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`konnexy_orders_${tenantId}`);
      if (saved) {
        try { setOrders(JSON.parse(saved)); } catch (e) { console.error(e); }
      } else {
        // Demo Orders for Kitchen Display
        const demoOrders: KitchenOrder[] = [
          {
            id: 'ord-101',
            tenant_id: tenantId,
            customer_name: 'Carlos Eduardo',
            order_type: 'table',
            table_number: '04',
            payment_method: 'pix',
            items: [
              { product: { id: 'p1', name: 'Burger Angus Supremo', price: 38.90 } as any, quantity: 2, notes: 'Sem cebola' },
              { product: { id: 'p2', name: 'Batata Trufada', price: 24.90 } as any, quantity: 1 },
            ],
            total_amount: 102.70,
            status: 'pending',
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: 'ord-102',
            tenant_id: tenantId,
            customer_name: 'Mariana Santos',
            order_type: 'delivery',
            payment_method: 'card',
            items: [
              { product: { id: 'p3', name: 'Pizza Margherita Especial', price: 54.90 } as any, quantity: 1 },
              { product: { id: 'p4', name: 'Coca-Cola Zero (350ml)', price: 7.90 } as any, quantity: 2 },
            ],
            total_amount: 70.70,
            status: 'preparing',
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 'ord-103',
            tenant_id: tenantId,
            customer_name: 'Roberto Lima',
            order_type: 'takeaway',
            payment_method: 'cash',
            items: [
              { product: { id: 'p5', name: 'Combinado Sushi Omakase (20p)', price: 79.90 } as any, quantity: 1 },
            ],
            total_amount: 79.90,
            status: 'ready',
            created_at: new Date(Date.now() - 25 * 60000).toISOString(),
          },
        ];
        setOrders(demoOrders);
        localStorage.setItem(`konnexy_orders_${tenantId}`, JSON.stringify(demoOrders));
      }
    }
  }, [tenantId]);

  const updateOrderStatus = (orderId: string, nextStatus: KitchenOrder['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    setOrders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_orders_${tenantId}`, JSON.stringify(updated));
    }

    if (nextStatus === 'ready') {
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="space-y-6 max-w-6xl font-sans">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" /> KDS • Monitor de Pedidos da Cozinha
          </h2>
          <p className="text-xs text-zinc-400">Acompanhe e gerencie a fila de preparo de pratos em tempo real.</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 text-xs font-bold">
            ⚡ {orders.filter((o) => o.status !== 'completed').length} Pedidos Ativos
          </Badge>
        </div>
      </div>

      {/* 3 Columns Order Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COL 1: PENDENTES */}
        <div className="glass-panel p-4 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              🟡 Pendentes ({pendingOrders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">Nenhum pedido pendente</p>
            ) : (
              pendingOrders.map((o) => (
                <div key={o.id} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">{o.customer_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400">
                      {o.order_type === 'table' ? `Mesa #${o.table_number}` : o.order_type === 'delivery' ? 'Delivery' : 'Retirada'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-300 border-t border-b border-white/5 py-2">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.product.name}</span>
                        {it.notes && <span className="text-[10px] text-amber-400 italic">({it.notes})</span>}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateOrderStatus(o.id, 'preparing')}
                    className="w-full py-2 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-amber-400 transition-all active:scale-95 shadow-md"
                  >
                    <span>Iniciar Preparo</span> <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COL 2: EM PREPARO */}
        <div className="glass-panel p-4 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              🟧 Em Preparo ({preparingOrders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">Nenhum pedido em preparo</p>
            ) : (
              preparingOrders.map((o) => (
                <div key={o.id} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">{o.customer_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400">
                      {o.order_type === 'table' ? `Mesa #${o.table_number}` : o.order_type === 'delivery' ? 'Delivery' : 'Retirada'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-300 border-t border-b border-white/5 py-2">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.product.name}</span>
                        {it.notes && <span className="text-[10px] text-amber-400 italic">({it.notes})</span>}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateOrderStatus(o.id, 'ready')}
                    className="w-full py-2 rounded-xl bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-blue-600 transition-all active:scale-95 shadow-md"
                  >
                    <span>Marcar como Pronto</span> <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COL 3: PRONTOS */}
        <div className="glass-panel p-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              🟢 Prontos para Servir ({readyOrders.length})
            </h3>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">Nenhum pedido pronto no momento</p>
            ) : (
              readyOrders.map((o) => (
                <div key={o.id} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3 bg-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">{o.customer_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                      {o.order_type === 'table' ? `Mesa #${o.table_number}` : o.order_type === 'delivery' ? 'Delivery' : 'Retirada'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-300 border-t border-b border-white/5 py-2">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.product.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateOrderStatus(o.id, 'completed')}
                    className="w-full py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-all active:scale-95 shadow-md"
                  >
                    <span>Finalizar / Entregue</span> <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
