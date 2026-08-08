'use client';

import React, { useState, useEffect } from 'react';
import { Coupon, DeliveryZone } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Ticket, Truck, Plus, Trash2, Edit2, CheckCircle2, Tag, Percent, DollarSign, MapPin } from 'lucide-react';

interface CouponsManagerProps {
  tenantId: string;
}

export const CouponsManager: React.FC<CouponsManagerProps> = ({ tenantId }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCoupons = localStorage.getItem(`konnexy_coupons_${tenantId}`);
      if (savedCoupons) {
        try { setCoupons(JSON.parse(savedCoupons)); } catch (e) { console.error(e); }
      } else {
        // Initial Demo Coupon
        const demoCoupons: Coupon[] = [
          { id: 'c-1', tenant_id: tenantId, code: 'BEMVINDO10', discount_type: 'percent', discount_value: 10, min_order_amount: 30, is_active: true },
          { id: 'c-2', tenant_id: tenantId, code: 'FRETEGRATIS', discount_type: 'fixed', discount_value: 5, min_order_amount: 50, is_active: true },
        ];
        setCoupons(demoCoupons);
        localStorage.setItem(`konnexy_coupons_${tenantId}`, JSON.stringify(demoCoupons));
      }

      const savedZones = localStorage.getItem(`konnexy_zones_${tenantId}`);
      if (savedZones) {
        try { setDeliveryZones(JSON.parse(savedZones)); } catch (e) { console.error(e); }
      } else {
        const demoZones: DeliveryZone[] = [
          { id: 'z-1', tenant_id: tenantId, name: 'Centro / Bairro Principal', fee: 5.00, estimated_time: '20-30 min', is_active: true },
          { id: 'z-2', tenant_id: tenantId, name: 'Bairros Próximos (Raio 5km)', fee: 8.00, estimated_time: '30-45 min', is_active: true },
          { id: 'z-3', tenant_id: tenantId, name: 'Região Metropolitana / Distante', fee: 12.00, estimated_time: '45-60 min', is_active: true },
        ];
        setDeliveryZones(demoZones);
        localStorage.setItem(`konnexy_zones_${tenantId}`, JSON.stringify(demoZones));
      }
    }
  }, [tenantId]);

  const saveCouponsToStorage = (updated: Coupon[]) => {
    setCoupons(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_coupons_${tenantId}`, JSON.stringify(updated));
    }
  };

  const saveZonesToStorage = (updated: DeliveryZone[]) => {
    setDeliveryZones(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_zones_${tenantId}`, JSON.stringify(updated));
    }
  };

  // Coupon Handlers
  const handleOpenAddCoupon = () => {
    setEditingCoupon({
      code: '',
      discount_type: 'percent',
      discount_value: 10,
      min_order_amount: 0,
      is_active: true,
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code || !editingCoupon.discount_value) return;

    const cleanCode = editingCoupon.code.toUpperCase().trim().replace(/\s+/g, '');

    if (editingCoupon.id) {
      const updated = coupons.map((c) => (c.id === editingCoupon.id ? ({ ...c, ...editingCoupon, code: cleanCode } as Coupon) : c));
      saveCouponsToStorage(updated);
    } else {
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        tenant_id: tenantId,
        code: cleanCode,
        discount_type: editingCoupon.discount_type || 'percent',
        discount_value: Number(editingCoupon.discount_value),
        min_order_amount: Number(editingCoupon.min_order_amount || 0),
        is_active: editingCoupon.is_active ?? true,
      };
      saveCouponsToStorage([...coupons, newCoupon]);
    }
    setIsCouponModalOpen(false);
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Deseja excluir este cupom?')) {
      saveCouponsToStorage(coupons.filter((c) => c.id !== id));
    }
  };

  // Delivery Zone Handlers
  const handleOpenAddZone = () => {
    setEditingZone({
      name: '',
      fee: 5.00,
      estimated_time: '30-40 min',
      is_active: true,
    });
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone?.name || editingZone.fee === undefined) return;

    if (editingZone.id) {
      const updated = deliveryZones.map((z) => (z.id === editingZone.id ? ({ ...z, ...editingZone } as DeliveryZone) : z));
      saveZonesToStorage(updated);
    } else {
      const newZone: DeliveryZone = {
        id: `zone-${Date.now()}`,
        tenant_id: tenantId,
        name: editingZone.name,
        fee: Number(editingZone.fee),
        estimated_time: editingZone.estimated_time || '30-45 min',
        is_active: editingZone.is_active ?? true,
      };
      saveZonesToStorage([...deliveryZones, newZone]);
    }
    setIsZoneModalOpen(false);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm('Deseja excluir esta taxa de entrega?')) {
      saveZonesToStorage(deliveryZones.filter((z) => z.id !== id));
    }
  };

  return (
    <div className="space-y-10 max-w-4xl font-sans">
      {/* SECTION 1: DISCOUNT COUPONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" /> Cupons de Desconto
            </h2>
            <p className="text-xs text-zinc-400">Crie cupons promocionais para seus clientes aplicarem na finalização do pedido.</p>
          </div>

          <Button variant="primary" onClick={handleOpenAddCoupon} leftIcon={<Plus className="w-4 h-4" />}>
            Novo Cupom
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-base font-black text-amber-400">{c.code}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingCoupon(c); setIsCouponModalOpen(true); }} className="p-1.5 rounded-lg bg-white/5 text-zinc-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-300 space-y-1">
                <p>Desconto: <strong className="text-emerald-400">{c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `R$ ${c.discount_value.toFixed(2)} OFF`}</strong></p>
                {c.min_order_amount ? <p className="text-zinc-500 text-[11px]">Pedido mínimo: R$ {c.min_order_amount.toFixed(2)}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: DELIVERY ZONES & FEES */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" /> Taxas de Entrega por Bairro / Região
            </h2>
            <p className="text-xs text-zinc-400">Cadastre os valores de frete para cálculo automático no carrinho de delivery.</p>
          </div>

          <Button variant="primary" onClick={handleOpenAddZone} leftIcon={<Plus className="w-4 h-4" />}>
            Nova Região
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {deliveryZones.map((z) => (
            <div key={z.id} className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm truncate">{z.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingZone(z); setIsZoneModalOpen(true); }} className="p-1.5 rounded-lg bg-white/5 text-zinc-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteZone(z.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-zinc-400">{z.estimated_time || '30 min'}</span>
                <span className="text-base font-extrabold text-emerald-400">R$ {z.fee.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal CRUD Cupom */}
      <Modal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} title={editingCoupon?.id ? 'Editar Cupom' : 'Novo Cupom de Desconto'} maxWidth="md">
        <form onSubmit={handleSaveCoupon} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Código do Cupom (Ex: BEMVINDO10) *</label>
            <input
              type="text"
              value={editingCoupon?.code || ''}
              onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
              placeholder="EX: PRIMEIRACOMPRA"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-amber-400 font-mono font-bold border border-white/10 uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Tipo de Desconto</label>
              <select
                value={editingCoupon?.discount_type || 'percent'}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white bg-zinc-900 border border-white/10"
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Valor do Desconto *</label>
              <input
                type="number"
                step="0.01"
                value={editingCoupon?.discount_value || 10}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Valor Mínimo do Pedido (R$)</label>
            <input
              type="number"
              step="0.01"
              value={editingCoupon?.min_order_amount || 0}
              onChange={(e) => setEditingCoupon({ ...editingCoupon, min_order_amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCouponModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Salvar Cupom</Button>
          </div>
        </form>
      </Modal>

      {/* Modal CRUD Região de Entrega */}
      <Modal isOpen={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} title={editingZone?.id ? 'Editar Região' : 'Nova Região de Entrega'} maxWidth="md">
        <form onSubmit={handleSaveZone} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Nome do Bairro / Região *</label>
            <input
              type="text"
              value={editingZone?.name || ''}
              onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
              placeholder="Ex: Centro / Zona Sul"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Taxa de Entrega (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={editingZone?.fee || 5.00}
                onChange={(e) => setEditingZone({ ...editingZone, fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Tempo Estimado</label>
              <input
                type="text"
                value={editingZone?.estimated_time || ''}
                onChange={(e) => setEditingZone({ ...editingZone, estimated_time: e.target.value })}
                placeholder="Ex: 30-40 min"
                className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsZoneModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Salvar Região</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
