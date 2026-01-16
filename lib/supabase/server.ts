import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabaseサーバーサイドクライアントを作成
 * Server ComponentsやServer Actionsで使用
 * 
 * @returns Supabaseクライアントインスタンス
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // サーバーコンポーネントでのクッキー設定は制限あり
            // エラーは無視（Route HandlersやServer Actionsでは正常に動作）
          }
        },
      },
    }
  );
}
