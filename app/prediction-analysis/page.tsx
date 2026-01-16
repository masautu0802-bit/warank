import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PredictionAnalysisPageClient } from '@/components/features/predictions/PredictionAnalysisPageClient';
import { calculateAppData } from '@/lib/utils/calculatePoints';
import {
  checkPredictionWin,
  getPredictionDetails,
} from '@/lib/utils/predictionUtils';
import type { PredictionResult } from '@/lib/types';

export default async function PredictionAnalysisPage() {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/prediction-analysis');
  }

  // ユーザーの予想を取得
  const { data: predictions } = await supabase
    .from('event_predictions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 全データを取得
  const [comediansResult, eventsResult, performancesResult] =
    await Promise.all([
      supabase.from('comedians').select('*'),
      supabase.from('events').select('*'),
      supabase.from('performances').select('*'),
    ]);

  const appData = calculateAppData({
    comedians: comediansResult.data || [],
    events: eventsResult.data || [],
    performances: performancesResult.data || [],
  });

  // 予想結果を計算
  const results: PredictionResult[] = [];
  const comedianNames: Record<string, string> = {};
  Object.values(appData.comedians).forEach((c) => {
    comedianNames[c.id] = c.name;
  });

  predictions?.forEach((prediction) => {
    const event = appData.events[prediction.event_id];
    if (!event) return;

    const actualPerformances = appData.performances
      .filter((p) => p.event_id === prediction.event_id)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999));

    try {
      const predictionEntries = prediction.predictions as Array<{
        predictionType: string;
        predictedComedianIds: string[];
        betPoints: number;
        odds?: number;
      }>;

      if (Array.isArray(predictionEntries)) {
        predictionEntries.forEach((entry) => {
          const isWon = checkPredictionWin(
            entry.predictionType as any,
            entry.predictedComedianIds,
            actualPerformances
          );
          const odds = entry.odds || 1;
          const payout = isWon ? entry.betPoints * odds : 0;
          const profit = payout - entry.betPoints;

          const details = getPredictionDetails(
            entry.predictionType as any,
            entry.predictedComedianIds,
            actualPerformances,
            comedianNames
          );

          results.push({
            eventId: event.id,
            eventName: event.name,
            predictionType: entry.predictionType as any,
            isWon,
            betPoints: entry.betPoints,
            odds,
            payout,
            profit,
            details,
            predictedComedianNames: entry.predictedComedianIds.map(
              (id) => comedianNames[id] || '不明'
            ),
            actualComedianNames: actualPerformances
              .slice(0, entry.predictionType === 'winner' ? 1 : 3)
              .map((p) => comedianNames[p.comedian_id] || '不明'),
            createdAt: prediction.created_at,
          });
        });
      }
    } catch (err) {
      console.error('予想結果の計算エラー:', err);
    }
  });

  return <PredictionAnalysisPageClient results={results} />;
}
