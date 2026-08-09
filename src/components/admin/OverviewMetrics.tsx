'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  QrCode,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Clock,
  Flame,
  Info,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Receipt,
  UtensilsCrossed,
  Truck,
  Store,
  Wallet,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { KitchenOrder } from '@/types';

interface OverviewMetricsProps {
  tenantId?: string;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ tenantId = 'default' }) => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [analytics, setAnalytics] = useState<{
    views: number;
    qrScans: number;
    clicks: number;
    events: Array<{ type: string; details: string; time: string }>;
  }>({
    views: 0,
    qrScans: 0,
    clicks: 0,
    events: [],
  });

  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('all');

  const loadData = async () => {
    // 1. Load Orders from Storage + API
    let allOrders: KitchenOrder[] = [];
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem(`konnexy_orders_${tenantId}`) ||
        localStorage.getItem('konnexy_orders_t-1') ||
        localStorage.getItem('konnexy_orders_default');
      if (saved) {
        try {
          allOrders = JSON.parse(saved);
        } catch (e) {}
      }
    }

    try {
      const res = await fetch(`/api/orders?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success && data.orders) {
        const apiOrders: KitchenOrder[] = data.orders;
        const map = new Map<string, KitchenOrder>();
        allOrders.forEach((o) => map.set(o.id, o));
        apiOrders.forEach((o) => map.set(o.id, o));
        allOrders = Array.from(map.values());
      }
    } catch (e) {}

    setOrders(allOrders);

    // 2. Load Analytics from API
    try {
      const res = await fetch(`/api/analytics?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    window.addEventListener('storage', loadData);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('konnexy_realtime_sync');
      bc.onmessage = () => loadData();
    } catch (e) {}
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadData);
      if (bc) bc.close();
    };
  }, [tenantId]);

  // Financial Computations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Breakdown by Order Type
  const tableRevenue = orders
    .filter((o) => o.order_type === 'table')
    .reduce((acc, o) => acc + o.total_amount, 0);
  const deliveryRevenue = orders
    .filter((o) => o.order_type === 'delivery')
    .reduce((acc, o) => acc + o.total_amount, 0);
  const takeawayRevenue = orders
    .filter((o) => o.order_type === 'takeaway')
    .reduce((acc, o) => acc + o.total_amount, 0);

  // Breakdown by Payment Method
  const pixRevenue = orders
    .filter((o) => o.payment_method === 'pix')
    .reduce((acc, o) => acc + o.total_amount, 0);
  const cardRevenue = orders
    .filter((o) => o.payment_method === 'card')
    .reduce((acc, o) => acc + o.total_amount, 0);
  const cashRevenue = orders
    .filter((o) => o.payment_method === 'cash')
    .reduce((acc, o) => acc + o.total_amount, 0);

  // Conversion rate
  const totalViews = Math.max(analytics.views, totalOrdersCount > 0 ? totalOrdersCount * 2 : 0);
  const conversionRate = totalViews > 0 ? ((totalOrdersCount / totalViews) * 100).toFixed(1) : '0.0';

  // Product sales ranking
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const name = item.product?.name || 'Item';
      const price = item.product?.promo_price || item.product?.price || 0;
      const current = productSalesMap.get(name) || { name, quantity: 0, revenue: 0 };
      productSalesMap.set(name, {
        name,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + price * item.quantity,
      });
    });
  });
  const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4" /> Gestão Financeira & Desempenho
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Painel de Vendas em Tempo Real</h2>
          <p className="text-sm text-zinc-300 mt-1 max-w-xl">
            Acompanhe o faturamento bruto, tíquete médio, pedidos realizados e acessos ao seu cardápio em tempo real.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl glass-panel border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          Sincronizado ao Vivo
        </div>
      </div>

      {/* Main Financial Indicators (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-zinc-900/80 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Faturamento Total</span>
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-300/80 block mt-1 font-semibold">
              💰 Total arrecadado em vendas
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-zinc-900/80 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Pedidos Realizados</span>
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{totalOrdersCount}</span>
            <span className="text-xs text-amber-300/80 block mt-1 font-semibold">
              🛍️ Comandas e entregas finalizadas
            </span>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-zinc-900/80 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Ticket Médio</span>
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-blue-300/80 block mt-1 font-semibold">
              📊 Média gasta por cliente
            </span>
          </div>
        </div>

        {/* Traffic & Conversion */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-zinc-900/80 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Conversão de Vendas</span>
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{conversionRate}%</span>
            <span className="text-xs text-purple-300/80 block mt-1 font-semibold">
              👀 {totalViews} Acessos ao Cardápio ({analytics.qrScans} QRs)
            </span>
          </div>
        </div>
      </div>

      {/* Financial Breakdown: Order Type & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Order Type */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" /> Faturamento por Canal de Venda
          </h3>

          <div className="space-y-3">
            {/* Table Consumption */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    🪑
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Consumo na Mesa</span>
                    <span className="text-xs text-zinc-400">QR Code nas Mesas do Estabelecimento</span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-400">
                  R$ {tableRevenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? (tableRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Delivery */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    🛵
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Delivery para Entrega</span>
                    <span className="text-xs text-zinc-400">Pedidos entregues em domicílio</span>
                  </div>
                </div>
                <span className="text-base font-black text-blue-400">
                  R$ {deliveryRevenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? (deliveryRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Takeaway */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🛍️
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Retirada no Balcão</span>
                    <span className="text-xs text-zinc-400">Clientes buscam no estabelecimento</span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-400">
                  R$ {takeawayRevenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? (takeawayRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Payment Method */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" /> Formas de Pagamento Recebidas
          </h3>

          <div className="space-y-3">
            {/* PIX */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                    ⚡
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Pagamentos PIX</span>
                    <span className="text-xs text-zinc-400">Transferências instantâneas</span>
                  </div>
                </div>
                <span className="text-base font-black text-teal-400">
                  R$ {pixRevenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? (pixRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                    💳
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Cartão (Crédito / Débito)</span>
                    <span className="text-xs text-zinc-400">Maquininha física ou online</span>
                  </div>
                </div>
                <span className="text-base font-black text-purple-400">
                  R$ {cardRevenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? (cardRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cash */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    💵
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white block">Dinheiro Espécie</span>
                    <span className="text-xs text-zinc-400">Pagamento presencial em cédulas</span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-400">
                  R$ {cashRevenue.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Sold Products & Realtime Sales Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Sold Products */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Pratos Mais Vendidos & Lucrativos
          </h3>

          {topProducts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl p-4">
              <Info className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Nenhum pedido de venda registrado ainda.</p>
              <span className="text-[11px] text-amber-400 block mt-1">
                Os pratos mais vendidos pelos clientes surgirão automaticamente aqui.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                      <span className="text-xs text-zinc-400">{prod.quantity} unidades vendidas</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-400">
                    R$ {prod.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales Transactions History Log */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" /> Extrato Financeiro de Pedidos
          </h3>

          {orders.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl p-4">
              <Info className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Nenhum histórico de vendas registrado.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">{ord.customer_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-amber-400 text-[10px] font-extrabold uppercase">
                        {ord.order_type === 'table'
                          ? `Mesa #${ord.table_number}`
                          : ord.order_type === 'delivery'
                          ? 'Delivery'
                          : 'Retirada'}
                      </span>
                    </div>
                    <span className="text-zinc-400 block text-[11px]">
                      💳 Pagamento: {ord.payment_method.toUpperCase()} • {new Date(ord.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-sm font-black text-emerald-400 whitespace-nowrap">
                    R$ {ord.total_amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
