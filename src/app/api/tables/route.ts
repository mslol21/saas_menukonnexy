import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'default';

  let tables = globalThis.globalTablesStore?.[tenantId] || globalThis.globalTablesStore?.['default'] || [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('tenant_id', tenantId);

      if (data && !error && data.length > 0) {
        tables = data;
        if (globalThis.globalTablesStore) {
          globalThis.globalTablesStore[tenantId] = tables;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch tables from Supabase:', e);
    }
  }

  return NextResponse.json({ success: true, tables });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, tables, updateSingle } = body;

    const tid = tenantId || 'default';
    if (!globalThis.globalTablesStore) {
      globalThis.globalTablesStore = {};
    }

    if (tables && Array.isArray(tables)) {
      globalThis.globalTablesStore[tid] = tables;
      globalThis.globalTablesStore['default'] = tables;
    } else if (updateSingle) {
      const current = globalThis.globalTablesStore[tid] || [];
      const updated = current.map((t: any) =>
        t.id === updateSingle.tableId ? { ...t, ...updateSingle } : t
      );
      globalThis.globalTablesStore[tid] = updated;
      globalThis.globalTablesStore['default'] = updated;
    }

    if (isSupabaseConfigured() && tables) {
      try {
        await supabase.from('restaurant_tables').upsert(tables);
      } catch (e) {
        console.warn('Failed to save tables to Supabase:', e);
      }
    }

    return NextResponse.json({ success: true, tables: globalThis.globalTablesStore[tid] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
