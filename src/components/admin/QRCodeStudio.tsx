'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { QrCode, Printer, Download, Sparkles } from 'lucide-react';

interface QRCodeStudioProps {
  tenantSlug: string;
  tenantName: string;
}

export const QRCodeStudio: React.FC<QRCodeStudioProps> = ({ tenantSlug, tenantName }) => {
  const [tableNumber, setTableNumber] = useState<string>('01');
  const [customTitle, setCustomTitle] = useState<string>('FAÇA SEU PEDIDO');

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/menu/${tenantSlug}` : `https://menu.konnexy.com.br/menu/${tenantSlug}`;
  const targetUrl = tableNumber ? `${baseUrl}?mesa=${tableNumber}` : baseUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-orange-400" /> Studio de QR Code para Impressão
        </h2>
        <p className="text-xs text-zinc-400">Gere placas de QR Code personalizadas com a sua marca para colocar nas mesas.</p>
      </div>

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
              className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Número da Mesa</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10"
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
          <div className="p-8 bg-zinc-950 rounded-3xl border-4 border-orange-500 shadow-2xl inline-block max-w-xs mx-auto text-white">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5" />
            </div>

            <h4 className="text-xl font-black text-white uppercase tracking-tight">{tenantName}</h4>
            <span className="text-xs text-orange-400 font-extrabold uppercase tracking-widest block mb-4">
              MESA {tableNumber || 'GERAL'}
            </span>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <QRCodeSVG value={targetUrl} size={190} level="H" includeMargin={true} />
            </div>

            <p className="text-xs font-bold text-zinc-300 mt-4 tracking-wider uppercase">
              {customTitle}
            </p>
            <span className="text-[10px] text-zinc-500 block mt-1">Escaneie para abrir o cardápio no celular</span>
          </div>
        </div>
      </div>
    </div>
  );
};
