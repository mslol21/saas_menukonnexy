'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Trash2, Plus, Minus, Send, MapPin, Store, CreditCard, DollarSign, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhatsAppCartDrawerProps {
  tenantWhatsapp: string;
  tenantName: string;
}

export const WhatsAppCartDrawer: React.FC<WhatsAppCartDrawerProps> = ({
  tenantWhatsapp,
  tenantName,
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
    totalAmount,
    totalCount,
    generateWhatsAppLink,
  } = useCart();

  const handleSendOrder = () => {
    if (!customerName.trim()) {
      alert('Por favor, informe seu nome antes de enviar o pedido.');
      return;
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

    const waUrl = generateWhatsAppLink(tenantWhatsapp, tenantName);
    window.open(waUrl, '_blank');
  };

  return (
    <>
      {/* Floating Bottom Bar (visible when items > 0 and cart closed) */}
      {totalCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
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
              <span>R$ {totalAmount.toFixed(2)}</span>
              <Send className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="🛒 Seus Itens Selecionados" maxWidth="lg">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white">Seu carrinho está vazio</h4>
            <p className="text-xs text-zinc-400 mt-1">Navegue pelo cardápio e adicione pratos deliciosos!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Type Tabs */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Opção de Consumo</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setOrderType('table')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    orderType === 'table' ? 'bg-orange-500 text-white border-orange-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Consumo na Mesa
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    orderType === 'delivery' ? 'bg-orange-500 text-white border-orange-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> Delivery
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    orderType === 'takeaway' ? 'bg-orange-500 text-white border-orange-400 shadow-md' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <Store className="w-4 h-4" /> Retirada no Balcão
                </button>
              </div>
            </div>

            {/* Customer Name & Table Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Seu Nome *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
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
                    className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
                  />
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
                    paymentMethod === 'pix' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> Pix
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card' ? 'bg-blue-500/20 text-blue-400 border-blue-500' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Cartão
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'cash' ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'glass-panel text-zinc-400 border-white/10'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Dinheiro
                </button>
              </div>
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
                        <span className="text-xs text-orange-400 font-extrabold">R$ {(price * quantity).toFixed(2)}</span>
                        {notes && <p className="text-[10px] text-zinc-400 italic truncate">Obs: {notes}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs"
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total do Pedido:</span>
                <span className="text-xl font-black text-emerald-400">R$ {totalAmount.toFixed(2)}</span>
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
