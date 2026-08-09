import { NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase-server';

declare global {
  var globalAnalyticsStore: Record<string, {
    views: number;
    qrScans: number;
    clicks: number;
    events: Array<{ type: string; details: string; time: string }>;
  }>;
}

if (!globalThis.globalAnalyticsStore) {
  globalThis.globalAnalyticsStore = {};
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'default';

  const store = globalThis.globalAnalyticsStore[tenantId] ||
    globalThis.globalAnalyticsStore['default'] || {
      views: 0,
      qrScans: 0,
      clicks: 0,
      events: [],
    };

  return NextResponse.json({ success: true, analytics: store });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId = 'default', eventType, details } = body;

    if (!globalThis.globalAnalyticsStore[tenantId]) {
      globalThis.globalAnalyticsStore[tenantId] = { views: 0, qrScans: 0, clicks: 0, events: [] };
    }

    const store = globalThis.globalAnalyticsStore[tenantId];

    if (eventType === 'page_view') store.views += 1;
    if (eventType === 'qr_scan') { store.views += 1; store.qrScans += 1; }
    if (eventType === 'whatsapp_click') store.clicks += 1;

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const eventObj = {
      type: eventType,
      details: details || (eventType === 'page_view' ? 'Acesso ao Cardápio Digital' : eventType === 'qr_scan' ? 'Scan de QR Code na Mesa' : 'Pedido de Venda Realizado'),
      time: timeStr,
    };

    store.events.unshift(eventObj);
    if (store.events.length > 20) store.events.pop();

    globalThis.globalAnalyticsStore['default'] = store;

    // Usa Service Role Key (server-only) para gravar o evento de analytics.
    // Necessário porque a ANON_KEY foi revogada de analytics_events via REVOKE.
    if (isServerSupabaseConfigured() && supabaseServer) {
      try {
        await supabaseServer.from('analytics_events').insert({
          tenant_id: tenantId,
          event_type: eventType,
        });
      } catch (e) {}
    }

    return NextResponse.json({ success: true, analytics: store });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
