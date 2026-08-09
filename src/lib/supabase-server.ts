import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com Service Role Key — para uso exclusivo em rotas de servidor
 * (Next.js API Routes, Server Actions, Server Components).
 *
 * ⚠️ NUNCA importar este arquivo em componentes client-side ou lib/supabase.ts.
 * A Service Role Key ignora RLS completamente e tem acesso total ao banco.
 * Ela é uma variável de ambiente privada (sem prefixo NEXT_PUBLIC_) e é
 * inacessível via DevTools do navegador.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseServer = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export const isServerSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
