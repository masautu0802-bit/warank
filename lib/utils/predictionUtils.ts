/**
 * 予想機能ユーティリティ
 */

import type { Event, PredictionType, Performance, AppData } from '@/lib/types';

// 主要4大会のブランド名
const MAJOR_BRANDS = ['M-1', 'R-1', 'THE SECOND', 'キングオブコント'];

// 予想可能なイベントかどうかを判定
export function isPredictableEvent(
  brand: string | null,
  formatType: string
): boolean {
  if (!brand) return false;
  return MAJOR_BRANDS.includes(brand);
}

// 予想タイプごとのマルチプライヤー
function getTypeMultiplier(predictionType: PredictionType): number {
  switch (predictionType) {
    case 'winner':
      return 1.0; // 優勝予想は基本オッズ
    case 'top3':
      return 0.5; // 3位以内は低めのオッズ
    case 'finalist':
      return 0.3; // 決勝進出はさらに低めのオッズ
    default:
      return 1.0;
  }
}

// オッズを計算
export function calculateOdds(
  comedianId: string,
  eventId: string,
  predictionType: PredictionType,
  data: AppData
): number {
  const comedian = data.comedians[comedianId];
  if (!comedian) return 1.0;

  const totalPoints = comedian.totalPoints;

  // イベント参加芸人のポイントを取得
  const eventPerformances = data.performances.filter(
    (p) => p.event_id === eventId
  );

  if (eventPerformances.length === 0) return 1.0;

  // 参加芸人の平均ポイントを計算
  const averagePoints =
    eventPerformances.reduce((sum, p) => {
      const perfComedian = data.comedians[p.comedian_id];
      return sum + (perfComedian?.totalPoints || 0);
    }, 0) / eventPerformances.length;

  if (averagePoints === 0) return 1.0;

  // オッズを計算（人気度に反比例）
  const popularityRatio = totalPoints / averagePoints;
  const baseOdds = 1 / popularityRatio;

  // 予想形式による調整
  const typeMultiplier = getTypeMultiplier(predictionType);

  // 最小オッズを1.0、最大オッズを10.0に制限
  const odds = Math.max(1.0, Math.min(10.0, baseOdds * typeMultiplier));

  return Math.round(odds * 10) / 10; // 小数点第1位まで
}

// 予想が的中したかどうかを判定
export function checkPredictionWin(
  predictionType: PredictionType,
  predictedComedianIds: string[],
  actualPerformances: Performance[]
): boolean {
  const sortedPerformances = actualPerformances
    .filter((p) => p.rank !== null)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));

  switch (predictionType) {
    case 'winner':
      // 優勝予想：1位が予想した芸人か
      return (
        sortedPerformances.length > 0 &&
        sortedPerformances[0].rank === 1 &&
        predictedComedianIds.includes(sortedPerformances[0].comedian_id)
      );

    case 'top3':
      // 3位以内予想：1-3位に予想した芸人が含まれるか
      const top3Ids = sortedPerformances
        .filter((p) => p.rank !== null && p.rank <= 3)
        .map((p) => p.comedian_id);
      return predictedComedianIds.some((id) => top3Ids.includes(id));

    case 'finalist':
      // 決勝進出予想：決勝に進出したか（ここでは簡易的に上位半分を決勝とみなす）
      const finalistCount = Math.ceil(sortedPerformances.length / 2);
      const finalistIds = sortedPerformances
        .slice(0, finalistCount)
        .map((p) => p.comedian_id);
      return predictedComedianIds.some((id) => finalistIds.includes(id));

    default:
      return false;
  }
}

// 予想結果の詳細を取得
export function getPredictionDetails(
  predictionType: PredictionType,
  predictedComedianIds: string[],
  actualPerformances: Performance[],
  comedianNames: Record<string, string>
): string {
  const sortedPerformances = actualPerformances
    .filter((p) => p.rank !== null)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));

  const predictedNames = predictedComedianIds
    .map((id) => comedianNames[id])
    .filter(Boolean)
    .join('、');

  switch (predictionType) {
    case 'winner':
      if (sortedPerformances.length > 0 && sortedPerformances[0].rank === 1) {
        const winnerName =
          comedianNames[sortedPerformances[0].comedian_id] || '不明';
        return `予想: ${predictedNames} / 実際: ${winnerName}`;
      }
      return `予想: ${predictedNames} / 実際: 未確定`;

    case 'top3':
      const top3Names = sortedPerformances
        .filter((p) => p.rank !== null && p.rank <= 3)
        .map((p) => comedianNames[p.comedian_id] || '不明')
        .join('、');
      return `予想: ${predictedNames} / 実際の3位以内: ${top3Names || '未確定'}`;

    case 'finalist':
      const finalistCount = Math.ceil(sortedPerformances.length / 2);
      const finalistNames = sortedPerformances
        .slice(0, finalistCount)
        .map((p) => comedianNames[p.comedian_id] || '不明')
        .join('、');
      return `予想: ${predictedNames} / 実際の決勝進出: ${finalistNames || '未確定'}`;

    default:
      return `予想: ${predictedNames}`;
  }
}
