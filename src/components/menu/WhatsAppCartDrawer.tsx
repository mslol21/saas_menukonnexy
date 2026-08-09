'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Trash2, Plus, Minus, Send, MapPin, Store, CreditCard, DollarSign, QrCode, Tag, CheckCircle2, Search, Loader2, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DistanceDeliveryConfig, DeliveryCalculationResult, KitchenOrder } from '@/types';
import { calculateDeliveryFeeByCep, formatCep } from '@/lib/cep-distance';

interface WhatsAppCartDrawerProps {
  tenantWhatsapp: string;
  tenantName: string;
  tenantId?: string;
  storeCep?: string;
}

export const WhatsAppCartDrawer: React.FC<WhatsAppCartDrawerProps> = ({
  tenantWhatsapp,
  tenantName,
  tenantId = 'default',
  storeCep = '14800-000',
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    orderType,
    setOrderType,
    paymentMethod,
    setPaymentMethod,
    subtotalAmount,
    totalAmount,
    totalCount,
    deliveryFee,
    setDeliveryFee,
    deliveryAddress,
    setDeliveryAddress,
    generateWhatsAppLink,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Delivery CEP calculation state
  const [cepInput, setCepInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [complementInput, setComplementInput] = useState('');
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [calcResult, setCalcResult] = useState<DeliveryCalculationResult | null>(null);

  // Load delivery config from localStorage
  const getDeliveryConfig = (): DistanceDeliveryConfig => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`konnexy_delivery_dist_config_${tenantId}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      enabled: true,
      mode: 'distance',
      store_cep: storeCep,
      base_fee: 5.00,
      base_distance_km: 3.0,
      price_per_km: 2.00,
      max_distance_km: 15.0,
    };
  };

  const handleCalculateCepFee = async (cepToCalc: string) => {
    const clean = cepToCalc.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsCalculatingFee(true);
    setCalcResult(null);

    const config = getDeliveryConfig();
    const result = await calculateDeliveryFeeByCep(config.store_cep || storeCep, clean, config);
    setCalcResult(result);
    setIsCalculatingFee(false);

    if (result.success && result.fee !== undefined && result.address) {
      setDeliveryFee(result.fee);
      setDeliveryAddress({
        cep: formatCep(clean),
        street: result.address.street,
        number: numberInput,
        neighborhood: result.address.neighborhood,
        city: result.address.city,
        state: result.address.state,
        complement: complementInput,
        distance_km: result.distance_km,
        fee: result.fee,
      });
    } else {
      setDeliveryFee(0);
      setDeliveryAddress(null);
    }
  };

  const handleNumberChange = (num: string) => {
    setNumberInput(num);
    if (deliveryAddress) {
      setDeliveryAddress({
        ...deliveryAddress,
        number: num,
      });
    }
  };

  const handleComplementChange = (comp: string) => {
    setComplementInput(comp);
    if (deliveryAddress) {
      setDeliveryAddress({
        ...deliveryAddress,
        complement: comp,
      });
    }
  };

  const handleApplyCoupon = () => {
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'BEMVINDO10') {
      const disc = subtotalAmount * 0.1;
      setAppliedCoupon({ code: 'BEMVINDO10', discount: disc });
    } else if (clean === 'FRETEGRATIS') {
      setAppliedCoupon({ code: 'FRETEGRATIS', discount: deliveryFee > 0 ? deliveryFee : 5.00 });
    } else {
      alert('Cupom inválido ou expirado.');
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const currentDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const finalTotal = Math.max(0, subtotalAmount - discountAmount + currentDeliveryFee);

  const handleSendOrder = () => {
    if (!customerName.trim()) {
      alert('Por favor, informe seu nome antes de enviar o pedido.');
      return;
    }

    if (orderType === 'delivery') {
      if (!deliveryAddress || !calcResult?.success) {
        alert('Por favor, informe um CEP de entrega válido e confirme a taxa de frete.');
        return;
      }
      if (!numberInput.trim()) {
        alert('Por favor, informe o número do imóvel para a entrega.');
        return;
      }
    }

    // Automatically update Table Status to 'Occupied' and accumulate consumption total
    if (tableNumber && tenantId) {
      try {
        const storageKey = `konnexy_tables_${tenantId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const tablesList: any[] = JSON.parse(saved);
          const updated = tablesList.map((t) => {
            if (t.number === tableNumber || t.number === tableNumber.padStart(2, '0')) {
              return {
                ...t,
                status: 'occupied',
                active_total: (t.active_total || 0) + finalTotal,
                orders_count: (t.orders_count || 0) + 1,
              };
            }
            return t;
          });
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to auto update table status:', e);
      }
    }

    // Save order into KDS (Kitchen Display System) orders list
    if (tenantId) {
      try {
        const ordersKey = `konnexy_orders_${tenantId}`;
        const existingOrders = localStorage.getItem(ordersKey);
        let ordersList: KitchenOrder[] = [];
        if (existingOrders) {
          try {
            ordersList = JSON.parse(existingOrders);
          } catch (e) {}
        }
        const newOrder: KitchenOrder = {
          id: `ord-${Date.now()}`,
          tenant_id: tenantId,
          customer_name: customerName,
          order_type: orderType,
          table_number: tableNumber || undefined,
          payment_method: paymentMethod,
          items: items.map((i) => ({ ...i })),
          total_amount: finalTotal,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        ordersList.unshift(newOrder);
        localStorage.setItem(ordersKey, JSON.stringify(ordersList));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error('Failed to save order to KDS storage:', e);
      }
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }

    const waUrl = generateWhatsAppLink(tenantWhatsapp, tenantName, discountAmount);
    window.open(waUrl, '_blank');
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Floating Bottom Bar (visible when items > 0 and cart closed) */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 font-sans">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-between transition-all duration-300 transform active:scale-95 border border-emerald-400/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                {totalCount}
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-90">Ver Carrinho</span>
                <span className="text-sm font-extrabold">Finalizar Pedido</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-black text-lg">
              <span>R$ {finalTotal.toFixed(2)}</span>
              <Send className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="🛒 Seus Itens Selecionados" maxWidth="lg">
        {items.length === 0 ? (
          <div className="text-center py-12 font-sans">
            <ShoppingBag className="w-16 h-16 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white">Seu carrinho está vazio</h4>
            <p className="text-xs text-zinc-400 mt-1">Navegue pelo cardápio e adicione pratos deliciosos!</p>
          </div>
        ) : (
          <div className="space-y-6 font-sans">
            {/* Order Type Tabs */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Opção de Consumo</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setOrderType('table')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    orderType === 'table' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Consumo na Mesa
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    orderType === 'delivery' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> Delivery
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    orderType === 'takeaway' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <Store className="w-4 h-4" /> Retirada no Balcão
                </button>
              </div>
            </div>

            {/* Customer Name & Table Number / Delivery CEP Address */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                </div>

                {orderType === 'table' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Número da Mesa</label>
                    <input
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ex: 04"
                      className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Address & CEP Calculation */}
              {orderType === 'delivery' && (
                <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Endereço de Entrega por CEP
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={cepInput}
                          onChange={(e) => setCepInput(e.target.value)}
                          onBlur={() => cepInput && handleCalculateCepFee(cepInput)}
                          placeholder="Informe seu CEP (ex: 14800-000)"
                          className="flex-1 px-3 py-2 rounded-xl glass-panel text-xs text-white border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => handleCalculateCepFee(cepInput)}
                          disabled={isCalculatingFee}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1 shrink-0 transition-all disabled:opacity-50"
                        >
                          {isCalculatingFee ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          <span>{isCalculatingFee ? 'Buscando...' : 'Calcular Frete'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={numberInput}
                        onChange={(e) => handleNumberChange(e.target.value)}
                        placeholder="Nº do Imóvel *"
                        className="w-full px-3 py-2 rounded-xl glass-panel text-xs text-white border border-white/10"
                        required
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={complementInput}
                    onChange={(e) => handleComplementChange(e.target.value)}
                    placeholder="Complemento (Ex: Apt 42, Bloco B - Opcional)"
                    className="w-full px-3 py-1.5 rounded-xl glass-panel text-xs text-white border border-white/10"
                  />

                  {/* Calculation Result Feedback */}
                  {calcResult && (
                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                      calcResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      {calcResult.success ? (
                        <>
                          <p className="font-bold">📍 {calcResult.address?.street}, {calcResult.address?.neighborhood} - {calcResult.address?.city}/{calcResult.address?.state}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-zinc-400">📏 Distância: {calcResult.distance_km} km</span>
                            <span className="font-extrabold text-emerald-400 text-sm">Frete: R$ {calcResult.fee?.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <p className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" /> {calcResult.error_message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Forma de Pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'pix' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> Pix
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card' ? 'bg-blue-500/20 text-blue-400 border-blue-500 font-bold' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Cartão
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'cash' ? 'bg-amber-500/20 text-amber-400 border-amber-500 font-bold' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Dinheiro
                </button>
              </div>
            </div>

            {/* Cupom de Desconto Field */}
            <div className="p-3 rounded-2xl glass-panel border border-white/10 space-y-2">
              <label className="block text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" /> Cupom de Desconto
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ex: BEMVINDO10"
                  className="flex-1 px-3 py-1.5 rounded-xl glass-panel text-xs text-amber-400 font-mono font-bold border border-white/10 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition-all active:scale-95"
                >
                  Aplicar
                </button>
              </div>
              {appliedCoupon && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cupom {appliedCoupon.code} aplicado (-R$ {appliedCoupon.discount.toFixed(2)})
                </span>
              )}
            </div>

            {/* Items List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Itens do Pedido ({items.length})</label>
                <button onClick={clearCart} className="text-xs text-rose-400 hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Limpar tudo
                </button>
              </div>

              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map(({ product, quantity, notes }) => {
                  const price = product.promo_price || product.price;
                  return (
                    <div key={product.id} className="glass-panel p-3 rounded-2xl flex items-center justify-between gap-3 border border-white/5">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                        <span className="text-xs text-amber-400 font-extrabold">R$ {(price * quantity).toFixed(2)}</span>
                        {notes && <p className="text-[10px] text-zinc-400 italic truncate">Obs: {notes}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotalAmount.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Desconto ({appliedCoupon.code}):</span>
                    <span>-R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div className="flex items-center justify-between text-amber-400">
                    <span>Taxa de Entrega:</span>
                    <span>{deliveryFee > 0 ? `+R$ ${deliveryFee.toFixed(2)}` : 'Digite o CEP'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10 font-bold">
                  <span className="text-white">Total do Pedido:</span>
                  <span className="text-xl font-black text-emerald-400">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="success"
                size="lg"
                onClick={handleSendOrder}
                className="w-full text-base font-bold gap-2 py-4"
              >
                <Send className="w-5 h-5" /> Enviar Pedido para o WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
