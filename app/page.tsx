import { createClient } from '@/lib/supabase/server';
import { calculateAppData } from '@/lib/utils/calculatePoints';
import { HomePageClient } from '@/components/features/home/HomePageClient';

export default async function HomePage() {
  // 環境変数のチェック（デバッグ用）
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!hasUrl || !hasKey) {
    console.error('環境変数が設定されていません:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? '設定済み' : '未設定');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasKey ? '設定済み' : '未設定');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">環境変数が設定されていません</h2>
          <p className="mb-4">
            .env.localファイルを作成し、以下の環境変数を設定してください:
          </p>
          <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
            {`NEXT_PUBLIC_SUPABASE_URL=https://ncwfvcwjzcloqnabtfrx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            環境変数を設定した後、開発サーバーを再起動してください。
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  
  // デバッグ: 環境変数の値（最初の数文字のみ表示）
  console.log('環境変数確認:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
  });

  // データ取得（Server Component）
  // エラーハンドリングを改善
  let comediansResult, eventsResult, performancesResult;
  
  try {
    [comediansResult, eventsResult, performancesResult] =
      await Promise.all([
        supabase.from('comedians').select('*'),
        supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true }),
        supabase.from('performances').select('*'),
      ]);
  } catch (fetchError: any) {
    console.error('データ取得時の例外:', fetchError);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ネットワークエラー</h2>
          <p className="text-sm text-destructive mb-4">
            Supabaseへの接続に失敗しました: {fetchError?.message || '不明なエラー'}
          </p>
          <div className="mt-4 p-4 bg-muted rounded">
            <p className="text-sm font-semibold mb-2">確認事項:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>インターネット接続を確認してください</li>
              <li>Supabaseプロジェクトがアクティブか確認してください</li>
              <li>環境変数のURLが正しいか確認してください</li>
              <li>ファイアウォールやプロキシの設定を確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // エラーチェック
  const errors: string[] = [];
  if (comediansResult.error) {
    const errorMsg = `芸人データ取得エラー: ${comediansResult.error.message} (コード: ${comediansResult.error.code})`;
    console.error(errorMsg, comediansResult.error);
    errors.push(errorMsg);
  }
  if (eventsResult.error) {
    const errorMsg = `イベントデータ取得エラー: ${eventsResult.error.message} (コード: ${eventsResult.error.code})`;
    console.error(errorMsg, eventsResult.error);
    errors.push(errorMsg);
  }
  if (performancesResult.error) {
    const errorMsg = `パフォーマンスデータ取得エラー: ${performancesResult.error.message} (コード: ${performancesResult.error.code})`;
    console.error(errorMsg, performancesResult.error);
    errors.push(errorMsg);
  }

  // エラーがある場合は表示
  if (errors.length > 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">データ取得エラー</h2>
          <div className="space-y-2 mb-4">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-destructive">
                {error}
              </p>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted rounded">
            <p className="text-sm font-semibold mb-2">確認事項:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>環境変数が正しく設定されているか確認してください</li>
              <li>開発サーバーを再起動してください（環境変数変更後）</li>
              <li>Supabaseプロジェクトがアクティブか確認してください</li>
              <li>RLSポリシーが正しく設定されているか確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ポイント計算（Server Component）
  const appData = calculateAppData({
    comedians: comediansResult.data || [],
    events: eventsResult.data || [],
    performances: performancesResult.data || [],
  });

  return <HomePageClient initialData={appData} />;
}
