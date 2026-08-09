'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RestaurantTable } from '@/types';
import {
  QrCode,
  Printer,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Users,
  UtensilsCrossed,
  Clock,
  ExternalLink,
  Copy,
  Layers,
  Sparkles,
  RefreshCw,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface QRCodeStudioProps {
  tenantSlug: string;
  tenantName: string;
  tenantId?: string;
}

export const QRCodeStudio: React.FC<QRCodeStudioProps> = ({
  tenantSlug,
  tenantName,
  tenantId = 'default',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'control' | 'print'>('control');

  // Tables list state
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form states
  const [editingTable, setEditingTable] = useState<Partial<RestaurantTable> | null>(null);
  const [batchCount, setBatchCount] = useState<number>(10);
  const [selectedTableForPrint, setSelectedTableForPrint] = useState<RestaurantTable | null>(null);

  // Single QR Plate generator state
  const [customTableNumber, setCustomTableNumber] = useState<string>('01');
  const [customTitle, setCustomTitle] = useState<string>('FAÇA SEU PEDIDO');

  // Notification feedback
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load tables from localStorage
  const loadTables = () => {
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem(`konnexy_tables_${tenantId}`) ||
        localStorage.getItem(`konnexy_tables_${tenantSlug}`) ||
        localStorage.getItem('konnexy_tables_t-1') ||
        localStorage.getItem('konnexy_tables_default');
      if (saved) {
        try {
          setTables(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Initial Demo Tables
        const demoTables: RestaurantTable[] = [
          { id: 't-1', tenant_id: tenantId, number: '01', name: 'Mesa 01 - Varanda', capacity: 2, status: 'available' },
          { id: 't-2', tenant_id: tenantId, number: '02', name: 'Mesa 02 - Salão Principal', capacity: 4, status: 'available' },
          { id: 't-3', tenant_id: tenantId, number: '03', name: 'Mesa 03 - Salão Principal', capacity: 4, status: 'available' },
          { id: 't-4', tenant_id: tenantId, number: '04', name: 'Mesa 04 - Área Externa', capacity: 6, status: 'available' },
          { id: 't-5', tenant_id: tenantId, number: '05', name: 'Mesa 05 - Salão VIP', capacity: 8, status: 'available' },
        ];
        setTables(demoTables);
        localStorage.setItem(`konnexy_tables_${tenantId}`, JSON.stringify(demoTables));
        localStorage.setItem('konnexy_tables_default', JSON.stringify(demoTables));
      }
    }
  };

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 1500);
    window.addEventListener('storage', loadTables);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('konnexy_realtime_sync');
      bc.onmessage = () => loadTables();
    } catch (e) {}
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadTables);
      if (bc) bc.close();
    };
  }, [tenantId, tenantSlug]);

  const saveTablesToStorage = (updated: RestaurantTable[]) => {
    setTables(updated);
    if (typeof window !== 'undefined') {
      const keys = Array.from(new Set([
        `konnexy_tables_${tenantId}`,
        `konnexy_tables_${tenantSlug}`,
        'konnexy_tables_t-1',
        'konnexy_tables_default',
      ]));
      keys.forEach((k) => localStorage.setItem(k, JSON.stringify(updated)));
      window.dispatchEvent(new Event('storage'));
      try {
        const bc = new BroadcastChannel('konnexy_realtime_sync');
        bc.postMessage({ type: 'TABLES_UPDATED' });
        bc.close();
      } catch (e) {}
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/menu/${tenantSlug}`;
    }
    return `https://menu.konnexy.com.br/menu/${tenantSlug}`;
  };

  const getTableUrl = (tableNum: string) => {
    return `${getBaseUrl()}?mesa=${tableNum}`;
  };

  // Metrics
  const totalTables = tables.length;
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const closingCount = tables.filter((t) => t.status === 'closing').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;
  const totalOpenRevenue = tables.reduce((acc, t) => acc + (t.active_total || 0), 0);

  // Table Handlers
  const handleOpenAdd = () => {
    const nextNum = (tables.length + 1).toString().padStart(2, '0');
    setEditingTable({
      number: nextNum,
      name: `Mesa ${nextNum} - Salão Principal`,
      capacity: 4,
      status: 'available',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable?.number) return;

    const formattedNum = editingTable.number.toString().padStart(2, '0');

    if (editingTable.id) {
      const updated = tables.map((t) =>
        t.id === editingTable.id
          ? ({ ...t, ...editingTable, number: formattedNum } as RestaurantTable)
          : t
      );
      saveTablesToStorage(updated);
    } else {
      const newTable: RestaurantTable = {
        id: `tbl-${Date.now()}`,
        tenant_id: tenantId,
        number: formattedNum,
        name: editingTable.name || `Mesa ${formattedNum}`,
        capacity: Number(editingTable.capacity || 4),
        status: editingTable.status || 'available',
        active_total: 0,
        orders_count: 0,
      };
      saveTablesToStorage([...tables, newTable]);
    }
    setIsAddModalOpen(false);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCount <= 0) return;

    const newBatch: RestaurantTable[] = [];
    const startIdx = tables.length + 1;

    for (let i = 0; i < batchCount; i++) {
      const numStr = (startIdx + i).toString().padStart(2, '0');
      newBatch.push({
        id: `tbl-batch-${Date.now()}-${i}`,
        tenant_id: tenantId,
        number: numStr,
        name: `Mesa ${numStr}`,
        capacity: 4,
        status: 'available',
        active_total: 0,
      });
    }

    saveTablesToStorage([...tables, ...newBatch]);
    setIsBatchModalOpen(false);
  };

  const handleUpdateStatus = (tableId: string, newStatus: RestaurantTable['status']) => {
    const updated = tables.map((t) => {
      if (t.id === tableId) {
        const isFreeing = newStatus === 'available';
        return {
          ...t,
          status: newStatus,
          active_total: isFreeing ? 0 : t.active_total,
          orders_count: isFreeing ? 0 : t.orders_count,
        };
      }
      return t;
    });
    saveTablesToStorage(updated);
  };

  const handleDeleteTable = (id: string) => {
    if (confirm('Deseja realmente excluir esta mesa?')) {
      saveTablesToStorage(tables.filter((t) => t.id !== id));
    }
  };

  const handleCopyLink = (tableNum: string) => {
    const url = getTableUrl(tableNum);
    navigator.clipboard.writeText(url);
    setCopySuccess(`Link da Mesa #${tableNum} copiado!`);
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const handleOpenPrintModal = (table: RestaurantTable) => {
    setSelectedTableForPrint(table);
    setCustomTableNumber(table.number);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl font-sans">
      {/* HEADER & TOP TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" /> Controle & Monitoramento de Mesas
          </h2>
          <p className="text-xs text-zinc-400">
            Gerencie suas mesas criadas, acompanhe o status em tempo real e imprima placas de QR Code.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="p-1 rounded-2xl glass-panel border border-white/10 flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('control')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'control'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" /> Monitor de Mesas ({tables.length})
          </button>
          <button
            onClick={() => setActiveSubTab('print')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'print'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Studio de QR Code
          </button>
        </div>
      </div>

      {copySuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {copySuccess}
        </div>
      )}

      {/* SUB-TAB 1: CONTROL & MONITORING */}
      {activeSubTab === 'control' && (
        <div className="space-y-6">
          {/* REALTIME METRICS SUMMARY */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total de Mesas</span>
              <p className="text-2xl font-black text-white">{totalTables}</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">🟢 Livres</span>
              <p className="text-2xl font-black text-emerald-400">{availableCount}</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🟡 Ocupadas</span>
              <p className="text-2xl font-black text-amber-400">{occupiedCount}</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">🔴 Em Fechamento</span>
              <p className="text-2xl font-black text-rose-400">{closingCount}</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">💰 Total Aberto</span>
              <p className="text-xl font-black text-blue-400">R$ {totalOpenRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Grade de Mesas Cadastradas
            </h3>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsBatchModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Criar em Lote
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Nova Mesa
              </Button>
            </div>
          </div>

          {/* TABLES GRID */}
          {tables.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 p-8">
              <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">Nenhuma mesa cadastrada</h4>
              <p className="text-xs text-zinc-400 mt-1">Clique em "Nova Mesa" ou "Criar em Lote" para cadastrar as mesas do seu estabelecimento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((t) => {
                const isOccupied = t.status === 'occupied';
                const isClosing = t.status === 'closing';
                const isReserved = t.status === 'reserved';

                let statusBadge = (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                    🟢 Livre
                  </span>
                );

                if (isOccupied) {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-extrabold border border-amber-500/30 flex items-center gap-1">
                      🟡 Ocupada
                    </span>
                  );
                } else if (isClosing) {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-extrabold border border-rose-500/30 flex items-center gap-1 animate-pulse">
                      🔴 Aguardando Conta
                    </span>
                  );
                } else if (isReserved) {
                  statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-extrabold border border-blue-500/30 flex items-center gap-1">
                      🔵 Reservada
                    </span>
                  );
                }

                return (
                  <div
                    key={t.id}
                    className={`glass-panel p-5 rounded-3xl border transition-all space-y-4 relative ${
                      isOccupied
                        ? 'border-amber-500/40 bg-amber-500/5'
                        : isClosing
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : 'border-white/10'
                    }`}
                  >
                    {/* Header: Table Number & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Mesa</span>
                        <h4 className="text-2xl font-black text-white">#{t.number}</h4>
                        <span className="text-xs text-zinc-300 font-medium truncate block max-w-[160px]">
                          {t.name || `Mesa ${t.number}`}
                        </span>
                      </div>
                      <div>{statusBadge}</div>
                    </div>

                    {/* Table Details */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-b border-white/5 py-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-zinc-400" /> {t.capacity || 4} Lugares
                      </span>

                      {t.active_total ? (
                        <span className="font-extrabold text-amber-400 text-sm">
                          Consumo: R$ {t.active_total.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Sem consumo aberto</span>
                      )}
                    </div>

                    {/* Status Changer Buttons */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Alterar Status</label>
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'available')}
                          className={`py-1 rounded-lg border transition-all ${
                            t.status === 'available' ? 'bg-emerald-500 text-zinc-950 font-black border-emerald-400' : 'glass-panel text-zinc-400 border-white/10'
                          }`}
                        >
                          Livre
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'occupied')}
                          className={`py-1 rounded-lg border transition-all ${
                            t.status === 'occupied' ? 'bg-amber-500 text-zinc-950 font-black border-amber-400' : 'glass-panel text-zinc-400 border-white/10'
                          }`}
                        >
                          Ocupada
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'closing')}
                          className={`py-1 rounded-lg border transition-all ${
                            t.status === 'closing' ? 'bg-rose-500 text-white font-black border-rose-400' : 'glass-panel text-zinc-400 border-white/10'
                          }`}
                        >
                          Conta
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'reserved')}
                          className={`py-1 rounded-lg border transition-all ${
                            t.status === 'reserved' ? 'bg-blue-500 text-white font-black border-blue-400' : 'glass-panel text-zinc-400 border-white/10'
                          }`}
                        >
                          Reser.
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenPrintModal(t)}
                          title="Imprimir QR Code da Mesa"
                          className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 font-bold transition-all text-xs flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Placa QR
                        </button>

                        <button
                          onClick={() => handleCopyLink(t.number)}
                          title="Copiar Link da Mesa"
                          className="p-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-all text-xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTable(t);
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-all text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteTable(t.id)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PRINT STUDIO GENERATOR */}
      {activeSubTab === 'print' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Controls Form */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Configuração da Placa</h3>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Título da Placa</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Número da Mesa</label>
              <input
                type="text"
                value={customTableNumber}
                onChange={(e) => setCustomTableNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-amber-400 font-mono font-bold border border-white/10"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-3">
              <Button variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                Imprimir Placa de Mesa
              </Button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="text-center">
            <div className="p-8 bg-zinc-950 rounded-3xl border-4 border-amber-500 shadow-2xl inline-block max-w-xs mx-auto text-white">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>

              <h4 className="text-xl font-black text-white uppercase tracking-tight">{tenantName}</h4>
              <span className="text-xs text-amber-400 font-extrabold uppercase tracking-widest block mb-4">
                MESA {customTableNumber || 'GERAL'}
              </span>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
                <QRCodeSVG value={getTableUrl(customTableNumber)} size={190} level="H" includeMargin={true} />
              </div>

              <p className="text-xs font-bold text-zinc-300 mt-4 tracking-wider uppercase">
                {customTitle}
              </p>
              <span className="text-[10px] text-zinc-500 block mt-1">Escaneie para abrir o cardápio no celular</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Single Table CRUD */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingTable?.id ? 'Editar Mesa' : 'Nova Mesa'} maxWidth="md">
        <form onSubmit={handleSaveTable} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Número / Código da Mesa *</label>
            <input
              type="text"
              value={editingTable?.number || ''}
              onChange={(e) => setEditingTable({ ...editingTable, number: e.target.value })}
              placeholder="Ex: 01"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-amber-400 font-bold border border-white/10"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Identificação / Setor</label>
            <input
              type="text"
              value={editingTable?.name || ''}
              onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
              placeholder="Ex: Mesa 01 - Salão Principal"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Capacidade (Número de Lugares)</label>
            <input
              type="number"
              value={editingTable?.capacity || 4}
              onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 4 })}
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Salvar Mesa</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Batch Creation */}
      <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="Gerar Mesas em Lote" maxWidth="md">
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <p className="text-xs text-zinc-400">
            Crie várias mesas numeradas automaticamente em sequência (ex: Mesa 06 até Mesa 15).
          </p>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Quantidade de Novas Mesas</label>
            <input
              type="number"
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-sm text-white border border-white/10"
              required
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsBatchModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Gerar Mesas</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Print Plate for Selected Table */}
      <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title={`Placa QR Code - Mesa #${selectedTableForPrint?.number}`} maxWidth="md">
        <div className="text-center space-y-6">
          <div className="p-6 bg-zinc-950 rounded-3xl border-4 border-amber-500 shadow-2xl inline-block max-w-xs mx-auto text-white">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>

            <h4 className="text-xl font-black text-white uppercase tracking-tight">{tenantName}</h4>
            <span className="text-xs text-amber-400 font-extrabold uppercase tracking-widest block mb-4">
              MESA #{selectedTableForPrint?.number}
            </span>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <QRCodeSVG value={getTableUrl(selectedTableForPrint?.number || '01')} size={180} level="H" includeMargin={true} />
            </div>

            <p className="text-xs font-bold text-zinc-300 mt-4 tracking-wider uppercase">
              {customTitle}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button variant="outline" type="button" onClick={() => setIsPrintModalOpen(false)}>Fechar</Button>
            <Button variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>Imprimir Placa</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
