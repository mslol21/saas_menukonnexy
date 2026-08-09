import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { KitchenOrder } from '@/types';

// In-memory cloud sync store for serverless environment
declare global {
  var globalOrdersStore: Record<string, KitchenOrder[]>;
  var globalTablesStore: Record<string, any[]>;
}

if (!globalThis.globalOrdersStore) {
  globalThis.globalOrdersStore = {};
}

if (!globalThis.globalTablesStore) {
  globalThis.globalTablesStore = {};
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'default';

  let orders: KitchenOrder[] = globalThis.globalOrdersStore[tenantId] || [];

  // If Supabase is configured, fetch from Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        orders = data as KitchenOrder[];
        globalThis.globalOrdersStore[tenantId] = orders;
      }
    } catch (e) {
      console.warn('Failed to fetch orders from Supabase:', e);
    }
  }

  return NextResponse.json({ success: true, orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order, tableUpdate } = body;

    if (!order || !order.tenant_id) {
      return NextResponse.json({ success: false, error: 'Order data missing' }, { status: 400 });
    }

    const tenantId = order.tenant_id;

    // 1. Update in-memory orders store
    if (!globalThis.globalOrdersStore[tenantId]) {
      globalThis.globalOrdersStore[tenantId] = [];
    }

    // Filter out duplicates if order id exists
    const existing = globalThis.globalOrdersStore[tenantId].filter((o) => o.id !== order.id);
    globalThis.globalOrdersStore[tenantId] = [order, ...existing];

    // 2. Also mirror to default key for fallback
    globalThis.globalOrdersStore['default'] = [order, ...(globalThis.globalOrdersStore['default'] || []).filter((o) => o.id !== order.id)];

    // 3. Update table status if tableUpdate is provided
    if (tableUpdate && tableUpdate.tableNumber) {
      const tableNum = tableUpdate.tableNumber;
      let tables = globalThis.globalTablesStore[tenantId] || [
        { id: 't-1', tenant_id: tenantId, number: '01', name: 'Mesa 01 - Varanda', capacity: 2, status: 'available' },
        { id: 't-2', tenant_id: tenantId, number: '02', name: 'Mesa 02 - Salão Principal', capacity: 4, status: 'available' },
        { id: 't-3', tenant_id: tenantId, number: '03', name: 'Mesa 03 - Salão Principal', capacity: 4, status: 'available' },
        { id: 't-4', tenant_id: tenantId, number: '04', name: 'Mesa 04 - Área Externa', capacity: 6, status: 'available' },
        { id: 't-5', tenant_id: tenantId, number: '05', name: 'Mesa 05 - Salão VIP', capacity: 8, status: 'available' },
      ];

      const cleanNum = tableNum.replace(/\D/g, '') || tableNum;
      const targetInt = parseInt(cleanNum, 10);

      let found = false;
      tables = tables.map((t: any) => {
        const tInt = parseInt((t.number || '').replace(/\D/g, ''), 10);
        if (
          t.number === tableNum ||
          t.number === cleanNum ||
          t.number === cleanNum.padStart(2, '0') ||
          (targetInt && tInt === targetInt)
        ) {
          found = true;
          return {
            ...t,
            status: 'occupied',
            active_total: (t.active_total || 0) + (tableUpdate.finalTotal || order.total_amount || 0),
            orders_count: (t.orders_count || 0) + 1,
          };
        }
        return t;
      });

      if (!found) {
        const numFormatted = cleanNum.padStart(2, '0');
        tables.push({
          id: `tbl-${Date.now()}`,
          tenant_id: tenantId,
          number: numFormatted,
          name: `Mesa ${numFormatted}`,
          capacity: 4,
          status: 'occupied',
          active_total: tableUpdate.finalTotal || order.total_amount || 0,
          orders_count: 1,
        });
      }

      globalThis.globalTablesStore[tenantId] = tables;
      globalThis.globalTablesStore['default'] = tables;

      // Sync tables to Supabase if available
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('restaurant_tables').upsert(tables);
        } catch (e) {
          console.warn('Failed to upsert tables in Supabase:', e);
        }
      }
    }

    // 4. Sync order to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').insert({
          id: order.id,
          tenant_id: order.tenant_id,
          customer_name: order.customer_name,
          order_type: order.order_type,
          table_number: order.table_number || null,
          payment_method: order.payment_method,
          items: order.items,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
        });
      } catch (e) {
        console.warn('Failed to insert order into Supabase:', e);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (e: any) {
    console.error('Error processing order API:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, tenantId, status } = body;

    if (!orderId || !tenantId || !status) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    if (globalThis.globalOrdersStore[tenantId]) {
      globalThis.globalOrdersStore[tenantId] = globalThis.globalOrdersStore[tenantId].map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
    }
    if (globalThis.globalOrdersStore['default']) {
      globalThis.globalOrdersStore['default'] = globalThis.globalOrdersStore['default'].map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('orders').update({ status }).eq('id', orderId);
      } catch (e) {
        console.warn('Failed to update order status in Supabase:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
