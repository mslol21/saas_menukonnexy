import { NextResponse } from 'next/server';
import { supabaseServer, isServerSupabaseConfigured } from '@/lib/supabase-server';

declare global {
  var globalAnalyticsStore: Record<string, {
    views: number;
    qrScans: number;
    clicks: number;
    events: Array<{ type: string; details: string; time: string }>;
  }>;
  // Rate limiting store: ip -> { count, windowStart }
  var globalAnalyticsRateLimit: Record<string, { count: number; windowStart: number }>;
}

if (!globalThis.globalAnalyticsStore) {
  globalThis.globalAnalyticsStore = {};
}
if (!globalThis.globalAnalyticsRateLimit) {
  globalThis.globalAnalyticsRateLimit = {};
}

/** Rate limit: máximo de 30 requisições por IP a cada 60 segundos */
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = globalThis.globalAnalyticsRateLimit[ip];

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    globalThis.globalAnalyticsRateLimit[ip] = { count: 1, windowStart: now };
    return true; // permitido
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // bloqueado
  }

  entry.count += 1;
  return true;
}

const VALID_EVENT_TYPES = new Set([
  'page_view', 'qr_scan', 'product_view', 'whatsapp_click',
]);

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
    // 1. Rate limiting por IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { tenantId = 'default', eventType, details } = body;

    // 2. Validar eventType para evitar dados inválidos no banco
    if (!VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // 3. Validar que o tenant_id corresponde a um restaurante real e ativo
    // Usamos o supabaseServer (Service Role) para a validação também
    if (tenantId !== 'default' && isServerSupabaseConfigured() && supabaseServer) {
      const { data: tenantExists } = await supabaseServer
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .eq('subscription_status', 'active')
        .maybeSingle();

      if (!tenantExists) {
        // Tenant inválido ou inativo — rejeitamos silenciosamente (sem vazar info)
        return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
      }
    }

    // 4. Atualizar store in-memory
    if (!globalThis.globalAnalyticsStore[tenantId]) {
      globalThis.globalAnalyticsStore[tenantId] = { views: 0, qrScans: 0, clicks: 0, events: [] };
    }

    const store = globalThis.globalAnalyticsStore[tenantId];

    if (eventType === 'page_view') store.views += 1;
    if (eventType === 'qr_scan') { store.views += 1; store.qrScans += 1; }
    if (eventType === 'whatsapp_click') store.clicks += 1;

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    store.events.unshift({
      type: eventType,
      details: details || (
        eventType === 'page_view' ? 'Acesso ao Cardápio Digital' :
        eventType === 'qr_scan' ? 'Scan de QR Code na Mesa' :
        'Pedido de Venda Realizado'
      ),
      time: timeStr,
    });
    if (store.events.length > 20) store.events.pop();

    globalThis.globalAnalyticsStore['default'] = store;

    // 5. Gravar no Supabase via Service Role Key (nunca ANON_KEY)
    // analytics_events tem REVOKE para anon — apenas Service Role pode inserir
    if (isServerSupabaseConfigured() && supabaseServer) {
      try {
        await supabaseServer.from('analytics_events').insert({
          tenant_id: tenantId,
          event_type: eventType,
        });
      } catch (e) { /* falha silenciosa — não bloqueia a resposta */ }
    }

    return NextResponse.json({ success: true, analytics: store });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
