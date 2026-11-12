import { ImageResponse } from 'next/og';
export const alt = 'Konnexy Menu — Cardápio digital com QR Code e WhatsApp';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 72, background: '#050711', color: '#f8fafc', borderBottom: '8px solid #22d3ee', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', color: '#22d3ee', fontSize: 30, letterSpacing: 4 }}>KONNEXY MENU</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.12 }}>Seu cardápio digital.<br />Seus pedidos organizados.</div>
        <div style={{ display: 'flex', fontSize: 27, color: '#cbd5e1' }}>QR Code por mesa · Pedidos no WhatsApp · Sem comissão</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 23, color: '#94a3b8' }}><span>menu.konnexy.com.br</span><span>Um produto Konnexy</span></div>
    </div>, size,
  );
}
