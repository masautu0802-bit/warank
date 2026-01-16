import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabaseクライアントサイドクライアントを作成
 * Client Componentsで使用
 * 
 * @returns Supabaseクライアントインスタンス
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
