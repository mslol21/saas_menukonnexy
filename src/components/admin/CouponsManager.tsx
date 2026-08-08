'use client';

import React, { useState, useEffect } from 'react';
import { Coupon, DeliveryZone, DistanceDeliveryConfig } from '@/types';
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

  // Distance Delivery State
  const [distanceConfig, setDistanceConfig] = useState<DistanceDeliveryConfig>({
    enabled: true,
    mode: 'distance',
    store_cep: '14800-000',
    base_fee: 5.00,
    base_distance_km: 3.0,
    price_per_km: 2.00,
    max_distance_km: 15.0,
  });

  const [deliveryMode, setDeliveryMode] = useState<'zone' | 'distance'>('distance');

  // Simulator state
  const [simTestCep, setSimTestCep] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCoupons = localStorage.getItem(`konnexy_coupons_${tenantId}`);
      if (savedCoupons) {
        try { setCoupons(JSON.parse(savedCoupons)); } catch (e) { console.error(e); }
      } else {
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

      const savedDist = localStorage.getItem(`konnexy_delivery_dist_config_${tenantId}`);
      if (savedDist) {
        try {
          const parsed = JSON.parse(savedDist);
          setDistanceConfig(parsed);
          if (parsed.mode) setDeliveryMode(parsed.mode);
        } catch (e) { console.error(e); }
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

  const saveDistanceConfigToStorage = (cfg: DistanceDeliveryConfig) => {
    setDistanceConfig(cfg);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`konnexy_delivery_dist_config_${tenantId}`, JSON.stringify(cfg));
    }
  };

  const handleToggleMode = (newMode: 'zone' | 'distance') => {
    setDeliveryMode(newMode);
    const updated = { ...distanceConfig, mode: newMode };
    saveDistanceConfigToStorage(updated);
  };

  const handleSimulateDelivery = async () => {
    if (!simTestCep.trim()) return;
    setIsSimulating(true);
    setSimResult(null);

    const { calculateDeliveryFeeByCep } = await import('@/lib/cep-distance');
    const res = await calculateDeliveryFeeByCep(distanceConfig.store_cep, simTestCep, distanceConfig);
    setSimResult(res);
    setIsSimulating(false);
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

      {/* SECTION 2: DELIVERY RATES & DISTANCE CEP CALCULATION */}
      <div className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" /> Regras de Taxa de Entrega
            </h2>
            <p className="text-xs text-zinc-400">Escolha o modelo de cobrança de frete no seu cardápio: por distância de CEP ou por bairro.</p>
          </div>

          {/* Mode Switcher */}
          <div className="p-1 rounded-2xl glass-panel border border-white/10 flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleToggleMode('distance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                deliveryMode === 'distance'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Cálculo por Distância & CEP
            </button>
            <button
              onClick={() => handleToggleMode('zone')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                deliveryMode === 'zone'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" /> Por Bairro / Região
            </button>
          </div>
        </div>

        {/* DISTANCE & CEP MODE CONFIGURATION */}
        {deliveryMode === 'distance' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Parâmetros de Cálculo de Distância por CEP
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Modo Ativo no Carrinho
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">CEP de Origem (Endereço da Loja) *</label>
                  <input
                    type="text"
                    value={distanceConfig.store_cep}
                    onChange={(e) => {
                      const updated = { ...distanceConfig, store_cep: e.target.value };
                      saveDistanceConfigToStorage(updated);
                    }}
                    placeholder="Ex: 14800-000"
                    className="w-full px-3.5 py-2 rounded-xl glass-panel text-sm text-amber-400 font-mono font-bold border border-white/10"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">A distância em km será calculada a partir deste CEP.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Taxa Base Inicial (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={distanceConfig.base_fee}
                    onChange={(e) => {
                      const updated = { ...distanceConfig, base_fee: parseFloat(e.target.value) || 0 };
                      saveDistanceConfigToStorage(updated);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">Valor fixo cobrado no primeiro raio de entrega.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Raio Base Incluso (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceConfig.base_distance_km}
                    onChange={(e) => {
                      const updated = { ...distanceConfig, base_distance_km: parseFloat(e.target.value) || 0 };
                      saveDistanceConfigToStorage(updated);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">Distância até onde vigora apenas a taxa base (ex: 3 km).</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Valor por km Adicional (R$/km) *</label>
                  <input
                    type="number"
                    step="0.50"
                    value={distanceConfig.price_per_km}
                    onChange={(e) => {
                      const updated = { ...distanceConfig, price_per_km: parseFloat(e.target.value) || 0 };
                      saveDistanceConfigToStorage(updated);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">Adicionado por km que exceder o raio base.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Distância Máxima de Entrega (km)</label>
                  <input
                    type="number"
                    step="1"
                    value={distanceConfig.max_distance_km}
                    onChange={(e) => {
                      const updated = { ...distanceConfig, max_distance_km: parseFloat(e.target.value) || 0 };
                      saveDistanceConfigToStorage(updated);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
                  />
                  <span className="text-[11px] text-zinc-400 mt-1 block">Pedidos além desta distância não serão aceitos (ex: 15 km).</span>
                </div>
              </div>

              {/* LIVE SIMULATOR FOR ADMIN */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  🧪 Testar / Simular Cálculo de CEP em Tempo Real
                </h4>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={simTestCep}
                    onChange={(e) => setSimTestCep(e.target.value)}
                    placeholder="Digite um CEP de teste (ex: 14801-000)"
                    className="flex-1 px-3 py-2 rounded-xl glass-panel text-xs text-white border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateDelivery}
                    disabled={isSimulating}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isSimulating ? 'Calculando...' : 'Simular Taxa'}
                  </button>
                </div>

                {simResult && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    simResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {simResult.success ? (
                      <>
                        <p className="font-bold text-sm">📍 Endereço Encontrado: {simResult.address?.street}, {simResult.address?.neighborhood} - {simResult.address?.city}/{simResult.address?.state}</p>
                        <p>📏 Distância Estimada: <strong>{simResult.distance_km} km</strong></p>
                        <p>💰 Taxa Calculada: <strong className="text-emerald-400 text-base">R$ {simResult.fee?.toFixed(2)}</strong></p>
                      </>
                    ) : (
                      <p className="font-bold">❌ {simResult.error_message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ZONE MODE CONFIGURATION */}
        {deliveryMode === 'zone' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-zinc-400">Cadastre os valores fixos de frete por bairro ou região.</span>
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
        )}
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
