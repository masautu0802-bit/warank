import { createClient } from '@/lib/supabase/server';
import { calculateAppData } from '@/lib/utils/calculatePoints';
import { RankingsPageClient } from '@/components/features/ranking/RankingsPageClient';

export default async function RankingsPage() {
  const supabase = await createClient();

  // データ取得
  const [comediansResult, eventsResult, performancesResult] =
    await Promise.all([
      supabase.from('comedians').select('*'),
      supabase.from('events').select('*'),
      supabase.from('performances').select('*'),
    ]);

  // エラーチェック
  if (comediansResult.error) {
    console.error('芸人データ取得エラー:', comediansResult.error);
  }
  if (eventsResult.error) {
    console.error('イベントデータ取得エラー:', eventsResult.error);
  }
  if (performancesResult.error) {
    console.error('パフォーマンスデータ取得エラー:', performancesResult.error);
  }

  // ポイント計算
  const appData = calculateAppData({
    comedians: comediansResult.data || [],
    events: eventsResult.data || [],
    performances: performancesResult.data || [],
  });

  // ランキング順にソート
  const rankings = Object.values(appData.comedians).sort(
    (a, b) => a.rank - b.rank
  );

  return <RankingsPageClient rankings={rankings} />;
}
