'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Printer, Download, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  tenantName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  tenantSlug,
  tenantName,
}) => {
  const [tableNumber, setTableNumber] = useState<string>('');

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/menu/${tenantSlug}` : `https://menu.konnexy.com.br/menu/${tenantSlug}`;
  const targetUrl = tableNumber ? `${baseUrl}?mesa=${tableNumber}` : baseUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📇 Gerador de QR Code" maxWidth="md">
      <div className="text-center space-y-5">
        <p className="text-xs text-zinc-300">
          Imprima ou salve o QR Code para disponibilizar nas mesas ou no balcão do seu estabelecimento.
        </p>

        {/* Table Number Filter Input */}
        <div className="max-w-xs mx-auto">
          <label className="block text-xs font-bold text-zinc-400 mb-1 text-left">Número da Mesa (Opcional)</label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Ex: 01 (Deixe em branco para QR Geral)"
            className="w-full px-3 py-2 rounded-xl glass-panel text-sm text-white border border-white/10 focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* Printable Card Area */}
        <div id="printable-qrcode" className="p-6 bg-white rounded-3xl text-zinc-900 shadow-2xl inline-block border-4 border-orange-500 max-w-xs mx-auto">
          <h4 className="text-lg font-black tracking-tight uppercase text-orange-600">{tenantName}</h4>
          <p className="text-[11px] text-zinc-600 font-semibold mb-4">
            {tableNumber ? `MESA ${tableNumber}` : 'CARDÁPIO DIGITAL'}
          </p>

          <div className="p-3 bg-zinc-50 rounded-2xl inline-block border border-zinc-200 shadow-inner">
            <QRCodeSVG value={targetUrl} size={180} level="H" includeMargin={true} />
          </div>

          <p className="text-[10px] text-zinc-500 mt-4 font-bold tracking-widest uppercase">
            Aponte a câmera para fazer seu pedido
          </p>
          <span className="text-[9px] text-orange-500 font-bold block mt-0.5">Konnexy Menu</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button variant="outline" className="flex-1" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Imprimir
          </Button>
        </div>
      </div>
    </Modal>
  );
};
